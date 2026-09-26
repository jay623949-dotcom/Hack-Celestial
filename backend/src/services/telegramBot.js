const TelegramBot = require('node-telegram-bot-api');
const incidentService = require('./incidentService');
const roomService = require('./roomService');
const guestService = require('./guestService');
const socketService = require('./socket.service');

// In-memory session tracking: chatId -> { step, roomNumber, guestName, roomType, isVip }
const sessions = {};

// Keyboards
const welcomeKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🏨 Book a Room', callback_data: 'book_room' },
        { text: '🔑 My Booking Details', callback_data: 'booking_details' },
      ],
    ],
  },
};

const roomTypeKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🏨 Deluxe Suite', callback_data: 'room_type_deluxe' },
        { text: '🛏 Standard Room', callback_data: 'room_type_standard' },
        { text: '🌊 Ocean Villa', callback_data: 'room_type_villa' },
      ],
    ],
  },
};

const vipKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '⭐ Yes, VIP Guest', callback_data: 'vip_yes' },
        { text: 'Standard Guest', callback_data: 'vip_no' },
      ],
    ],
  },
};

const guestMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '⚠️ Report an Issue', callback_data: 'report_issue' }],
      [{ text: '🛎 Request Amenities', callback_data: 'request_amenities' }],
      [{ text: '🕒 Late Checkout', callback_data: 'late_checkout' }],
    ],
  },
};

/**
 * Auto-triages guest complaints to assign reasonable severity and department
 */
function triageIncident(description = '') {
  const text = description.toLowerCase();
  let department = 'maintenance';
  let severity = 'medium';

  if (/\b(fire|flood|emergency|burst|gas|danger|hazard|spark|smoke)\b/i.test(text)) {
    severity = 'critical';
  } else if (/\b(leak|leaking|ac|air condition|air conditioner|power|broken|lock|toilet|hot water|freeze|freezing)\b/i.test(text)) {
    severity = 'high';
  } else if (/\b(slow|noisy|bulb|remote|towel|water bottle)\b/i.test(text)) {
    severity = 'low';
  }

  if (/\b(leak|leaking|ac|air condition|air conditioner|heater|heating|cooling|pipe|pipes|light|bulb|power|electricity|broken|toilet|flush|sink|shower|faucet|door|lock|tv|television|wifi)\b/i.test(text)) {
    department = 'maintenance';
  } else if (/\b(towel|towels|clean|cleaning|trash|bedding|sheet|sheets|pillow|pillows|linen|linens|soap|shampoo|dirty|dust|bathrobe)\b/i.test(text)) {
    department = 'housekeeping';
  } else if (/\b(food|drink|breakfast|dinner|service|dining|bar|room service)\b/i.test(text)) {
    department = 'front_desk';
  } else if (/\b(bill|checkout|checkin|payment|reservation|deposit)\b/i.test(text)) {
    department = 'front_desk';
  } else {
    department = 'maintenance';
  }

  return { department, severity };
}

/**
 * Creates an incident in Resort 360 backend from Telegram guest report
 * Accepts payload { room_number, description, source: 'Telegram' }
 */
async function createIncidentFromTelegram({ room_number, description, source = 'Telegram' }) {
  const rooms = roomService.getAll();
  const room = rooms.find(
    (r) => String(r.number) === String(room_number) || r.id === room_number || r.id === `room-${room_number}`
  );
  const roomId = room ? room.id : `room-${room_number}`;

  // If the room doesn't exist in dataStore yet, register it so relationships hold
  if (!roomService.getById(roomId)) {
    roomService.create({
      id: roomId,
      number: String(room_number),
      type: 'Deluxe Suite',
      status: 'occupied',
    });
  }

  const { department, severity } = triageIncident(description);
  const summarySnippet = description.length > 40 ? `${description.slice(0, 40)}...` : description;
  const title = `Guest Report (Room ${room_number}): ${summarySnippet}`;

  const incident = incidentService.create({
    title,
    description,
    severity,
    status: 'open',
    department,
    room_id: roomId,
    source,
    reported_at: new Date().toISOString(),
  });

  console.log(`[Telegram Bot] Incident logged for Room ${room_number}: ID ${incident.id} (${severity}/${department})`);

  // Broadcast to realtime operations dashboard via Socket.IO
  try {
    socketService.emit('incident:created', incident);
  } catch (err) {
    // Socket emit failure should not crash bot response
  }

  return incident;
}

/**
 * Allocates an available room, creates a guest record, and broadcasts real-time Socket.IO events
 */
async function allocateAndBookRoom({ chatId, guestName, roomType, isVip, sendMessage }) {
  try {
    const allRooms = roomService.getAll();
    const availableRooms = allRooms.filter(
      (r) => r.status && r.status.toLowerCase() === 'available'
    );

    let allocatedRoom = null;
    const lowerType = (roomType || '').toLowerCase();

    // 1. Try to find matching available room based on selected type
    if (lowerType.includes('deluxe') || lowerType.includes('suite')) {
      allocatedRoom = availableRooms.find(
        (r) => r.type && (r.type.toLowerCase().includes('deluxe') || r.type.toLowerCase().includes('suite'))
      );
    } else if (lowerType.includes('standard')) {
      allocatedRoom = availableRooms.find(
        (r) => r.type && r.type.toLowerCase().includes('standard')
      );
    } else if (lowerType.includes('villa') || lowerType.includes('ocean')) {
      allocatedRoom = availableRooms.find(
        (r) => r.type && (r.type.toLowerCase().includes('villa') || r.type.toLowerCase().includes('ocean'))
      );
    }

    // 2. Fallback to any available room if requested type is full
    if (!allocatedRoom) {
      if (availableRooms.length > 0) {
        allocatedRoom = availableRooms[0];
      } else {
        // No available rooms in resort
        await sendMessage(
          chatId,
          `⚠️ We apologize, but all ${roomType} rooms are currently occupied. Please select another room type or speak with our front desk.`,
          roomTypeKeyboard
        );
        sessions[chatId].step = 'AWAITING_BOOKING_ROOM_TYPE';
        return null;
      }
    }

    // 3. Mark room as occupied in roomService
    const updatedRoom = roomService.update(allocatedRoom.id, { status: 'occupied' }) || {
      ...allocatedRoom,
      status: 'occupied',
    };

    // 4. Create Guest record in guestService
    const newGuest = guestService.create({
      name: guestName,
      vip: Boolean(isVip),
      vip_tier: isVip ? 'VIP' : 'Standard',
      room_id: updatedRoom.id,
      room_number: updatedRoom.number,
      telegram_id: chatId,
      check_in: new Date().toISOString(),
      notes: `Direct in-chat booking via Telegram Concierge Bot`,
    });

    console.log(
      `[Telegram Bot] Booking confirmed: Guest "${guestName}" -> Room ${updatedRoom.number} (${updatedRoom.type}, VIP: ${isVip})`
    );

    // 5. Emit real-time Socket.IO events to update manager dashboard
    try {
      socketService.emit('guest:created', newGuest);
      socketService.emit('room:updated', updatedRoom);
      socketService.emit('room.status_changed', updatedRoom);
      socketService.emit('GUEST_CHECKED_IN', { guest: newGuest, room: updatedRoom });
    } catch (socketErr) {
      console.warn('[Telegram Bot] Socket emit error:', socketErr.message);
    }

    // 6. Update session state
    sessions[chatId].roomNumber = updatedRoom.number;
    sessions[chatId].guestName = guestName;
    sessions[chatId].isVip = isVip;
    sessions[chatId].step = 'VERIFIED';

    // 7. Send confirmation card
    const priorityLabel = isVip ? 'VIP' : 'Standard';
    const confirmationText =
`🎉 Booking Confirmed! Welcome to Resort 360.

👤 Guest: ${guestName}
🛎 Room: ${updatedRoom.number} (${updatedRoom.type || roomType})
⭐ Priority: ${priorityLabel}

Your stay is now active! You can use this chat anytime to request amenities, report maintenance issues, or view services.`;

    await sendMessage(chatId, confirmationText);

    // 8. Show the main verified guest menu
    await sendMessage(
      chatId,
      `How can our AI Concierge assist you in Room ${updatedRoom.number}?`,
      guestMenuKeyboard
    );

    return { guest: newGuest, room: updatedRoom };
  } catch (error) {
    console.error('[Telegram Bot] Error during room allocation and booking:', error);
    await sendMessage(
      chatId,
      '⚠️ An error occurred while confirming your reservation. Please try again or contact the front desk.'
    );
    return null;
  }
}

/**
 * Normalizes room type string from callback query or text
 */
function normalizeRoomType(raw) {
  const str = (raw || '').toLowerCase();
  if (str.includes('deluxe') || str.includes('suite')) return 'Deluxe Suite';
  if (str.includes('villa') || str.includes('ocean')) return 'Ocean Villa';
  if (str.includes('standard')) return 'Standard Room';
  return 'Deluxe Suite';
}

/**
 * Core stateful message processing logic (abstracted for direct testing & Telegram events)
 */
async function processIncomingText({ chatId, text, sendMessage }) {
  const rawText = (text || '').trim();
  const lowerText = rawText.toLowerCase();

  if (!sessions[chatId]) {
    sessions[chatId] = { step: 'IDLE', roomNumber: null };
  }
  const session = sessions[chatId];

  // 1. Command /start or Hello
  if (lowerText === '/start' || lowerText === 'hello' || lowerText === 'hi' || lowerText === 'hey') {
    sessions[chatId] = { step: 'IDLE', roomNumber: null };
    await sendMessage(
      chatId,
      '👋 Welcome to Resort 360 Concierge! 🌟 How may we assist you with your stay today?',
      welcomeKeyboard
    );
    return;
  }

  // 2. Action: Book a Room (trigger conversational booking funnel)
  if (lowerText === 'book a room' || lowerText === '🏨 book a room') {
    session.step = 'AWAITING_BOOKING_NAME';
    await sendMessage(
      chatId,
      "🛎 Great! Let's get you checked into Resort 360. What is your full name?"
    );
    return;
  }

  // 3. Step: AWAITING_BOOKING_NAME
  if (session.step === 'AWAITING_BOOKING_NAME') {
    session.guestName = rawText;
    session.step = 'AWAITING_BOOKING_ROOM_TYPE';
    await sendMessage(
      chatId,
      `Nice to meet you, ${session.guestName}! Please select your preferred room type:`,
      roomTypeKeyboard
    );
    return;
  }

  // 4. Step: AWAITING_BOOKING_ROOM_TYPE (via text input fallback)
  if (session.step === 'AWAITING_BOOKING_ROOM_TYPE') {
    session.roomType = normalizeRoomType(rawText);
    session.step = 'AWAITING_BOOKING_VIP_STATUS';
    await sendMessage(
      chatId,
      'Are you checking in under a VIP priority reservation?',
      vipKeyboard
    );
    return;
  }

  // 5. Step: AWAITING_BOOKING_VIP_STATUS (via text input fallback)
  if (session.step === 'AWAITING_BOOKING_VIP_STATUS') {
    const isVip = /vip|yes|true|elite|star/i.test(lowerText);
    session.isVip = isVip;
    await allocateAndBookRoom({
      chatId,
      guestName: session.guestName,
      roomType: session.roomType,
      isVip,
      sendMessage,
    });
    return;
  }

  // 6. Action: My Booking Details
  if (lowerText === 'my booking details' || lowerText === '🔑 my booking details') {
    session.step = 'AWAITING_ROOM';
    await sendMessage(chatId, 'Please enter your Room Number to verify your stay:');
    return;
  }

  // 7. Receiving Room Number
  if (session.step === 'AWAITING_ROOM') {
    session.roomNumber = rawText;
    session.step = 'VERIFIED';
    await sendMessage(
      chatId,
      `✅ Room ${session.roomNumber} verified! Welcome to your guest portal. Please select an option:`,
      guestMenuKeyboard
    );
    return;
  }

  // 8. Action: Report an Issue
  if (lowerText === 'report an issue' || lowerText === '⚠️ report an issue') {
    session.step = 'AWAITING_COMPLAINT';
    await sendMessage(
      chatId,
      'Please describe the issue in detail, and our AI Concierge will route it immediately.'
    );
    return;
  }

  // 9. Action: Request Amenities
  if (lowerText === 'request amenities' || lowerText === '🛎 request amenities') {
    const roomStr = session.roomNumber ? `for Room ${session.roomNumber}` : '';
    await sendMessage(
      chatId,
      `🛎 Housekeeping has received your amenities request ${roomStr}. Fresh towels and toiletries will be delivered shortly!`,
      guestMenuKeyboard
    );
    return;
  }

  // 10. Action: Late Checkout
  if (lowerText === 'late checkout' || lowerText === '🕒 late checkout') {
    const roomStr = session.roomNumber ? `for Room ${session.roomNumber}` : '';
    await sendMessage(
      chatId,
      `🕒 Your late checkout request ${roomStr} has been submitted to Front Desk management. Standard checkout is 11:00 AM; requested late checkout: 1:00 PM.`,
      guestMenuKeyboard
    );
    return;
  }

  // 11. Receiving the Complaint
  if (session.step === 'AWAITING_COMPLAINT') {
    const complaintText = rawText;
    await createIncidentFromTelegram({
      room_number: session.roomNumber,
      description: complaintText,
      source: 'Telegram',
    });

    await sendMessage(
      chatId,
      '✅ Your issue has been logged. Our AI has alerted the staff, and a technician/housekeeper will be assigned shortly.'
    );

    // Reset session state to VERIFIED
    session.step = 'VERIFIED';

    // Send guest menu keyboard again for any follow-up needs
    await sendMessage(
      chatId,
      'Is there anything else we can assist you with?',
      guestMenuKeyboard
    );
    return;
  }

  // Default fallback if not recognized
  if (session.step === 'VERIFIED') {
    await sendMessage(
      chatId,
      `You are currently verified in Room ${session.roomNumber}. Please choose an option from the menu:`,
      guestMenuKeyboard
    );
  } else {
    await sendMessage(
      chatId,
      'Welcome to Resort 360! Please send /start or "Hello" to access the main menu.',
      welcomeKeyboard
    );
  }
}

/**
 * Handles Telegram callback queries from inline buttons
 */
async function processCallbackQuery({ queryId, chatId, data, answerCallback, sendMessage }) {
  if (answerCallback) {
    await answerCallback(queryId);
  }

  if (!sessions[chatId]) {
    sessions[chatId] = { step: 'IDLE', roomNumber: null };
  }
  const session = sessions[chatId];

  switch (data) {
    case 'book_room':
      session.step = 'AWAITING_BOOKING_NAME';
      await sendMessage(
        chatId,
        "🛎 Great! Let's get you checked into Resort 360. What is your full name?"
      );
      break;

    case 'room_type_deluxe':
    case 'room_type_standard':
    case 'room_type_villa':
      session.roomType = normalizeRoomType(data);
      session.step = 'AWAITING_BOOKING_VIP_STATUS';
      await sendMessage(
        chatId,
        'Are you checking in under a VIP priority reservation?',
        vipKeyboard
      );
      break;

    case 'vip_yes':
    case 'vip_no':
      const isVip = data === 'vip_yes';
      session.isVip = isVip;
      await allocateAndBookRoom({
        chatId,
        guestName: session.guestName || 'Valued Guest',
        roomType: session.roomType || 'Deluxe Suite',
        isVip,
        sendMessage,
      });
      break;

    case 'booking_details':
      session.step = 'AWAITING_ROOM';
      await sendMessage(chatId, 'Please enter your Room Number to verify your stay:');
      break;

    case 'report_issue':
      session.step = 'AWAITING_COMPLAINT';
      await sendMessage(
        chatId,
        'Please describe the issue in detail, and our AI Concierge will route it immediately.'
      );
      break;

    case 'request_amenities':
      await sendMessage(
        chatId,
        `🛎 Housekeeping has received your amenities request for Room ${session.roomNumber || 'your stay'}. Fresh towels and toiletries will be delivered shortly!`,
        guestMenuKeyboard
      );
      break;

    case 'late_checkout':
      await sendMessage(
        chatId,
        `🕒 Your late checkout request for Room ${session.roomNumber || 'your stay'} has been submitted to Front Desk management. Standard checkout: 11:00 AM; requested: 1:00 PM.`,
        guestMenuKeyboard
      );
      break;

    default:
      await sendMessage(chatId, 'Option not recognized. Please use the menu buttons below:', welcomeKeyboard);
      break;
  }
}

let botInstance = null;

/**
 * Initializes the Telegram Bot with polling
 */
function initBot(token = process.env.TELEGRAM_BOT_TOKEN) {
  if (!token) {
    console.log('[Telegram Bot] TELEGRAM_BOT_TOKEN not provided. Bot not initialized.');
    return null;
  }

  if (botInstance) {
    return botInstance;
  }

  try {
    botInstance = new TelegramBot(token, { polling: true });
    console.log('[Telegram Bot] Initialized successfully with polling = true.');

    // Message handler
    botInstance.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      if (!text) return;

      try {
        await processIncomingText({
          chatId,
          text,
          sendMessage: (targetChatId, replyText, opts) => botInstance.sendMessage(targetChatId, replyText, opts),
        });
      } catch (err) {
        console.error(`[Telegram Bot] Error processing message from chatId ${chatId}:`, err);
        botInstance.sendMessage(chatId, 'An error occurred while processing your request. Please try again.');
      }
    });

    // Callback query handler
    botInstance.on('callback_query', async (query) => {
      const chatId = query.message?.chat?.id;
      const data = query.data;
      if (!chatId) return;

      try {
        await processCallbackQuery({
          queryId: query.id,
          chatId,
          data,
          answerCallback: (id) => botInstance.answerCallbackQuery(id).catch(() => {}),
          sendMessage: (targetChatId, replyText, opts) => botInstance.sendMessage(targetChatId, replyText, opts),
        });
      } catch (err) {
        console.error(`[Telegram Bot] Error processing callback query ${data}:`, err);
      }
    });

    // Handle polling errors safely without crashing process
    botInstance.on('polling_error', (error) => {
      console.error('[Telegram Bot Polling Error]:', error.code || error.message);
    });

    return botInstance;
  } catch (error) {
    console.error('[Telegram Bot] Failed to initialize Telegram Bot:', error.message);
    return null;
  }
}

// Auto-initialize if TELEGRAM_BOT_TOKEN is present in environment
if (process.env.TELEGRAM_BOT_TOKEN) {
  initBot(process.env.TELEGRAM_BOT_TOKEN);
}

module.exports = {
  initBot,
  getBot: () => botInstance,
  sessions,
  createIncidentFromTelegram,
  allocateAndBookRoom,
  processIncomingText,
  processCallbackQuery,
  welcomeKeyboard,
  roomTypeKeyboard,
  vipKeyboard,
  guestMenuKeyboard,
};
