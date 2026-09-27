const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const nodeTg = require('node-telegram-bot-api');

const TelegramBot = typeof nodeTg === 'function' ? nodeTg : (nodeTg.Bot || nodeTg.TelegramBot || null);

let botInstance = null;
let lastUsedToken = null;

/**
 * Dynamically resolves the Telegram Bot Token from process.env,
 * with automatic fallback reload from .env if updated at runtime.
 */
function getBotToken() {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !token.trim()) {
    try {
      const envPath = path.resolve(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
        if (parsed.TELEGRAM_BOT_TOKEN && parsed.TELEGRAM_BOT_TOKEN.trim()) {
          token = parsed.TELEGRAM_BOT_TOKEN.trim();
          process.env.TELEGRAM_BOT_TOKEN = token;
        }
      }
    } catch (_) {
      // Fallback ignore
    }
  }
  return (token && token.trim()) || '';
}

/**
 * Safely initializes or retrieves the TelegramBot instance.
 * Attaches error listeners to prevent unhandled EventEmitter crashes.
 */
function getBot(token) {
  const activeToken = token || getBotToken();
  if (!activeToken) return null;

  if (!botInstance || lastUsedToken !== activeToken) {
    try {
      if (typeof TelegramBot === 'function') {
        botInstance = new TelegramBot(activeToken, { polling: false });
        // Suppress unhandled error events from node-telegram-bot-api
        botInstance.on('error', (err) => {
          console.warn('[TelegramBot] Internal error event:', err.message);
        });
        botInstance.on('polling_error', (err) => {
          console.warn('[TelegramBot] Polling error event:', err.message);
        });
      }
      lastUsedToken = activeToken;
    } catch (err) {
      console.error('[TelegramService] Error initializing TelegramBot client:', err.message);
      botInstance = null;
    }
  }
  return botInstance;
}

/**
 * Checks connection and retrieves bot metadata from Telegram API.
 */
async function getBotInfo() {
  const token = getBotToken();
  if (!token) {
    return {
      configured: false,
      reason: 'TELEGRAM_BOT_TOKEN is not configured in backend/.env',
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (res.ok && data.ok) {
      return {
        configured: true,
        bot: data.result,
      };
    }
    return {
      configured: false,
      error: data.description || `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      configured: false,
      error: err.message,
    };
  }
}

/**
 * Cleans the chat ID and resolves usernames to numeric IDs via recent bot updates if needed.
 */
async function resolveChatId(rawChatId, token) {
  if (!rawChatId) return null;
  const clean = String(rawChatId).trim().replace(/^['"]|['"]$/g, '');

  // If already numeric (e.g. "123456789" or group "-100123456789")
  if (/^-?\d+$/.test(clean)) {
    return clean;
  }

  // If it's a username (e.g. "@username" or "username"), Telegram requires numeric IDs for DMs.
  // Check getUpdates to see if this user recently messaged the bot
  const targetUsername = clean.replace(/^@/, '').toLowerCase();
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
    const data = await res.json();
    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        const msg = update.message || update.edited_message || update.channel_post;
        if (msg) {
          const chat = msg.chat;
          const from = msg.from;
          if (
            (chat?.username && chat.username.toLowerCase() === targetUsername) ||
            (from?.username && from.username.toLowerCase() === targetUsername)
          ) {
            console.log(`[TelegramService] Resolved username @${targetUsername} to chat ID: ${chat.id}`);
            return String(chat.id);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[TelegramService] Username lookup via getUpdates failed:', err.message);
  }

  return clean;
}

/**
 * Dispatches a detailed welcome and room allocation message directly to the guest's Telegram chat.
 *
 * @param {Object} params
 * @param {string|number} params.chatId - Guest's Telegram chat ID or username
 * @param {string} params.guestName - Name of the guest
 * @param {string|number} params.roomNumber - Assigned room number
 * @param {string} params.roomType - Assigned room type (e.g. Deluxe Suite)
 * @param {string|Date} [params.checkInTime] - Check-in timestamp or string
 * @returns {Promise<{ success: boolean, messageId?: number, reason?: string, error?: string }>}
 */
async function sendGuestWelcomeMessage({ chatId, guestName, roomNumber, roomType, checkInTime } = {}) {
  try {
    if (!chatId) {
      console.warn('[TelegramService] No chatId provided. Skipping welcome message dispatch.');
      return { success: false, reason: 'Missing chatId' };
    }

    const token = getBotToken();
    if (!token) {
      const warnMsg = 'TELEGRAM_BOT_TOKEN is not configured in backend/.env. Skipping message dispatch.';
      console.warn(`[TelegramService] Warning: ${warnMsg}`);
      return { success: false, reason: 'TELEGRAM_BOT_TOKEN not configured' };
    }

    const targetChatId = await resolveChatId(chatId, token);

    const name = (guestName && String(guestName).trim()) || 'Guest';
    const room = (roomNumber !== undefined && roomNumber !== null && String(roomNumber).trim() !== '')
      ? String(roomNumber)
      : 'Assigned upon arrival';
    const type = (roomType && String(roomType).trim()) || 'Standard Suite';

    let time = '';
    if (checkInTime) {
      if (typeof checkInTime === 'string') {
        const parsed = new Date(checkInTime);
        if (!isNaN(parsed.getTime())) {
          time = parsed.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
        } else {
          time = checkInTime;
        }
      } else if (checkInTime instanceof Date) {
        time = checkInTime.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
      } else {
        time = String(checkInTime);
      }
    } else {
      time = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }

    const message = 
`🌴 Welcome to Resort 360, ${name}! 🌴

Your check-in has been processed and your room is ready.
🛎 Room Number: ${room}
🏨 Room Type: ${type}
⏰ Check-In Time: ${time}

You can reply to this chat anytime with maintenance requests, housekeeping needs, or general inquiries. Our AI Concierge is active 24/7 to assist you.`;

    let sent = null;
    let dispatchError = null;

    // Primary: Native HTTP fetch to Telegram Bot API
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        sent = data.result;
      } else {
        let errDesc = data.description || `HTTP ${response.status}`;
        if (errDesc.includes('chat not found')) {
          errDesc = `Chat '${targetChatId}' not found. To receive Telegram messages, the guest must first open your bot and press /start, or provide their numeric Telegram User ID.`;
        } else if (errDesc.includes('bot was blocked by the user')) {
          errDesc = 'The guest has blocked this bot on Telegram.';
        } else if (errDesc.includes('Unauthorized')) {
          errDesc = 'Invalid TELEGRAM_BOT_TOKEN in .env. Please check the bot token from @BotFather.';
        }
        dispatchError = new Error(errDesc);
      }
    } catch (fetchErr) {
      dispatchError = fetchErr;
    }

    // Fallback: node-telegram-bot-api if fetch had a network error and bot is configured
    if (!sent && dispatchError) {
      const bot = getBot(token);
      if (bot && typeof bot.sendMessage === 'function') {
        try {
          sent = await bot.sendMessage(targetChatId, message);
          dispatchError = null;
        } catch (botErr) {
          // Keep the best descriptive error
          dispatchError = botErr;
        }
      }
    }

    if (dispatchError) {
      console.error(`[TelegramService] Error sending welcome message to chatId ${chatId}:`, dispatchError.message);
      return { success: false, error: dispatchError.message };
    }

    console.log(`[TelegramService] Successfully dispatched welcome message to chatId: ${targetChatId} (message_id: ${sent?.message_id})`);
    return { success: true, messageId: sent?.message_id };
  } catch (error) {
    console.error(`[TelegramService] Unexpected error sending welcome message to chatId ${chatId}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendGuestWelcomeMessage,
  getBot,
  getBotInfo,
  getBotToken,
  resolveChatId,
};
