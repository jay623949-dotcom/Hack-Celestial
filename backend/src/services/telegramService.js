/**
 * Resort 360 - Telegram Bot Service
 * Enables resort guests to report incidents, maintenance issues, and housekeeping
 * requests directly via Telegram with automatic AI swarm triage and status replies.
 */

const TelegramBot = require('node-telegram-bot-api');
const incidentService = require('./incidentService');
const roomService = require('./roomService');
const guestService = require('./guestService');
const orchestratorService = require('./orchestrator.service');

// Optional Smart Resort 360 event bus integration for live dashboard updates
let eventBus = null;
try {
  eventBus = require('../smart-resort/eventBus');
} catch (e) {
  // Graceful fallback if smart-resort module not present
}

class TelegramService {
  constructor() {
    this.bot = null;
    this.chatSessions = new Map(); // chatId -> { guestId, guestName, roomId, lastIncidentId }
    this.isInitialized = false;
  }

  /**
   * Initialize Telegram Bot with polling
   * @param {string} token Telegram bot token (optional, falls back to process.env.TELEGRAM_BOT_TOKEN)
   */
  initBot(token = process.env.TELEGRAM_BOT_TOKEN) {
    if (this.bot) {
      console.log('[TelegramService] Bot already initialized.');
      return this.bot;
    }

    if (!token || token.trim() === '' || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
      console.log('[TelegramService] TELEGRAM_BOT_TOKEN not provided or empty. Bot initialization skipped.');
      return null;
    }

    try {
      console.log('[TelegramService] Initializing Telegram Bot with polling...');
      this.bot = new TelegramBot(token.trim(), { polling: true });
      this.isInitialized = true;

      // Handle polling errors to avoid unhandled rejections
      this.bot.on('polling_error', (error) => {
        console.warn('[TelegramService] Polling warning:', error.message || error.code || error);
      });

      // Register message event listener
      this.bot.on('message', async (msg) => {
        await this.handleIncomingMessage(msg);
      });

      console.log('[TelegramService] ✅ Telegram Bot successfully initialized and listening for guest messages.');
      return this.bot;
    } catch (err) {
      console.error('[TelegramService] Error initializing Telegram Bot:', err.message);
      this.bot = null;
      this.isInitialized = false;
      return null;
    }
  }

  /**
   * Process incoming Telegram messages
   * @param {object} msg Telegram Message object
   */
  async handleIncomingMessage(msg) {
    const chatId = msg.chat?.id;
    const text = msg.text ? msg.text.trim() : '';

    if (!chatId || !text) return;

    const fromUser = msg.from || {};
    const guestName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || fromUser.username || 'Valued Guest';

    // 1. Handle commands: /start, /help, /status
    if (text.startsWith('/start') || text.startsWith('/help')) {
      return this.sendWelcomeMessage(chatId, guestName);
    }

    if (text.startsWith('/status')) {
      return this.sendStatusMessage(chatId);
    }

    try {
      // 2. Map Telegram chatId to a guest profile & room
      const session = this.getOrCreateSession(chatId, guestName, text);

      // 3. Classify department and severity based on complaint content
      const { department, severity, title } = this.triageComplaint(text);

      // 4. Create internal incident
      const incidentData = {
        title,
        description: `[Reported via Telegram by ${guestName} (Chat #${chatId})]: ${text}`,
        severity,
        status: 'open',
        department,
        room_id: session.roomId,
        guest_id: session.guestId,
      };

      const incident = incidentService.create(incidentData);
      session.lastIncidentId = incident.id;

      console.log(`[TelegramService] Created incident #${incident.id} for Room ${session.roomNumber || session.roomId} from Telegram chat ${chatId}`);

      // 5. Send immediate confirmation back to Telegram guest
      const confirmationReply = [
        `🛎️ *Thank you, ${guestName}!*`,
        `Resort 360 AI is analyzing your request and routing it to the *${this.formatDepartment(department)}* department.`,
        ``,
        `📋 *Incident Ticket:* \`#${incident.id}\``,
        `📍 *Assigned Room:* ${session.roomNumber || session.roomId}`,
        `⚡ *Priority:* ${severity.toUpperCase()}`,
        `🕒 *Reported At:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        ``,
        `Our autonomous agents and on-duty resort staff have been notified. We will update you here as soon as action is taken.`,
      ].join('\n');

      await this.bot.sendMessage(chatId, confirmationReply, { parse_mode: 'Markdown' });

      // 6. Broadcast event to live event bus if active
      if (eventBus && typeof eventBus.publish === 'function') {
        eventBus.publish(eventBus.EVENTS.MAINTENANCE_REQUIRED || 'INCIDENT_REPORTED', {
          incident_id: incident.id,
          room_id: session.roomId,
          room_number: session.roomNumber || session.roomId,
          department,
          severity,
          source: 'telegram_bot',
          description: text,
          reason: `Guest reported via Telegram: ${text.slice(0, 100)}`,
        }).catch((e) => console.warn('[TelegramService] EventBus publish warning:', e.message));
      }

      // 7. Trigger AI Agent Swarm Consensus in background
      this.triggerSwarmAnalysis(incident, text, chatId).catch((e) =>
        console.warn('[TelegramService] Swarm analysis warning:', e.message)
      );
    } catch (err) {
      console.error('[TelegramService] Error handling incoming message:', err);
      try {
        await this.bot.sendMessage(
          chatId,
          '⚠️ We received your message, but encountered an internal processing delay. Our Front Desk duty manager has been notified directly.'
        );
      } catch (sendErr) {
        console.error('[TelegramService] Failed to send error message:', sendErr.message);
      }
    }
  }

  /**
   * Helper to retrieve or create a mock guest session for this chat
   */
  getOrCreateSession(chatId, guestName, text) {
    let session = this.chatSessions.get(chatId);

    // Check if the guest explicitly mentioned a room number in their message
    const extractedRoom = this.extractRoomNumber(text);

    if (!session) {
      // Find a valid mock room in dataStore or default to room-102
      let room = null;
      try {
        const rooms = roomService.getAll();
        if (extractedRoom) {
          room = rooms.find(
            (r) => String(r.number) === extractedRoom || r.id === `room-${extractedRoom}` || r.id === extractedRoom
          );
        }
        if (!room && rooms.length > 0) {
          // Default to an available or occupied resort room for hackathon demonstration
          room = rooms.find((r) => r.id === 'room-102' || r.number === '102') || rooms[0];
        }
      } catch (e) {
        // Fallback
      }

      const roomId = room ? room.id : (extractedRoom ? `room-${extractedRoom}` : 'room-102');
      const roomNumber = room ? room.number : (extractedRoom || '102');

      // Create guest profile
      let guest = null;
      try {
        guest = guestService.create({
          name: `${guestName} (Telegram)`,
          vip: false,
          vip_tier: 'Standard',
          room_id: roomId,
          notes: `Linked to Telegram Chat ID ${chatId}`,
        });
      } catch (e) {
        guest = { id: `guest-tg-${chatId.toString().slice(-4)}` };
      }

      session = {
        chatId,
        guestId: guest ? guest.id : `guest-tg-${chatId}`,
        guestName,
        roomId,
        roomNumber,
        createdAt: new Date(),
      };
      this.chatSessions.set(chatId, session);
    } else if (extractedRoom) {
      // Update room if guest mentions a new one
      session.roomNumber = extractedRoom;
      session.roomId = `room-${extractedRoom}`;
    }

    return session;
  }

  /**
   * Extract room numbers from text (e.g. "Room 204", "suite 301", "102")
   */
  extractRoomNumber(text) {
    if (!text) return null;
    const match = text.match(/(?:room|suite|villa|rm)\s*#?\s*([A-Za-z0-9-]+)/i) ||
                  text.match(/\b([1-3]\d{2}|V0[1-3])\b/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Heuristic triage for department and severity
   */
  triageComplaint(text) {
    const lower = text.toLowerCase();

    // 1. Department Detection
    let department = 'general';
    if (
      lower.includes('leak') || lower.includes('water') || lower.includes('pipe') ||
      lower.includes('plumb') || lower.includes('drain') || lower.includes('sink') ||
      lower.includes('shower') || lower.includes('toilet') || lower.includes('hvac') ||
      lower.includes('ac') || lower.includes('air conditioning') || lower.includes('cold') ||
      lower.includes('heat') || lower.includes('light') || lower.includes('power') ||
      lower.includes('electric') || lower.includes('broken') || lower.includes('door') ||
      lower.includes('key') || lower.includes('lock') || lower.includes('tv')
    ) {
      department = 'maintenance';
    } else if (
      lower.includes('towel') || lower.includes('clean') || lower.includes('linen') ||
      lower.includes('sheet') || lower.includes('pillow') || lower.includes('soap') ||
      lower.includes('shampoo') || lower.includes('trash') || lower.includes('dirty') ||
      lower.includes('spill') || lower.includes('vacuum') || lower.includes('housekeep')
    ) {
      department = 'housekeeping';
    } else if (
      lower.includes('bill') || lower.includes('charge') || lower.includes('rate') ||
      lower.includes('cost') || lower.includes('refund') || lower.includes('folio') ||
      lower.includes('deposit') || lower.includes('checkout')
    ) {
      department = 'front_desk';
    } else if (
      lower.includes('checkin') || lower.includes('arrival') || lower.includes('luggage') ||
      lower.includes('bag') || lower.includes('valet') || lower.includes('taxi') ||
      lower.includes('noise') || lower.includes('loud') || lower.includes('neighbor')
    ) {
      department = 'front_desk';
    }

    // 2. Severity Detection
    let severity = 'low';
    if (
      lower.includes('fire') || lower.includes('flood') || lower.includes('burst') ||
      lower.includes('rupture') || lower.includes('smoke') || lower.includes('spark') ||
      lower.includes('emergency') || lower.includes('urgent') || lower.includes('danger')
    ) {
      severity = 'critical';
    } else if (
      lower.includes('leak') || lower.includes('not working') || lower.includes('stopped') ||
      lower.includes('not cooling') || lower.includes('blowing hot') || lower.includes('no hot water') ||
      lower.includes('freezing') || lower.includes('sweltering') || lower.includes('broken') ||
      lower.includes('shatter') || lower.includes('spark') || lower.includes('overflow')
    ) {
      severity = 'high';
    } else if (
      lower.includes('dirty') || lower.includes('missing') || lower.includes('need') ||
      lower.includes('slow') || lower.includes('towel') || lower.includes('clean') ||
      lower.includes('soap') || lower.includes('refill')
    ) {
      severity = 'medium';
    }


    // 3. Title summary
    const words = text.split(' ').slice(0, 7).join(' ');
    const title = `${severity.toUpperCase()}: ${words}${text.length > words.length ? '...' : ''}`;

    return { department, severity, title };
  }

  /**
   * Format department for display
   */
  formatDepartment(dept) {
    switch (dept) {
      case 'maintenance': return 'Engineering & Maintenance';
      case 'housekeeping': return 'Housekeeping & Turndown';
      case 'front_desk': return 'Front Desk Operations';
      default: return 'Guest Services';
    }
  }

  /**
   * Trigger AI Swarm Consensus in the background and optionally notify guest
   */
  async triggerSwarmAnalysis(incident, text, chatId) {
    try {
      const trigger = {
        type: 'guest_reported_incident',
        description: `Telegram guest incident #${incident.id}: ${text}`,
        incident_id: incident.id,
      };

      const analysis = await orchestratorService.orchestrateConsensus({ trigger });
      if (analysis && analysis.consensus && this.bot) {
        const ruling = analysis.consensus.ruling || analysis.consensus.summary;
        if (ruling) {
          const followUp = [
            `🤖 *Resort 360 AI Swarm Update:*`,
            `Our multi-agent consensus engine has formulated an action plan for Ticket #${incident.id}:`,
            ``,
            `_${ruling.slice(0, 280)}${ruling.length > 280 ? '...' : ''}_`,
          ].join('\n');

          await this.bot.sendMessage(chatId, followUp, { parse_mode: 'Markdown' });
        }
      }
    } catch (err) {
      // Swarm is non-blocking; don't break the user flow
      console.warn('[TelegramService] Swarm consensus background execution note:', err.message);
    }
  }

  /**
   * Send Welcome message
   */
  async sendWelcomeMessage(chatId, guestName) {
    const welcome = [
      `🌴 *Welcome to Azure Bay Resort 360 Assistant!*`,
      ``,
      `Hello ${guestName}, I am your direct AI concierge connected to our hotel operations swarm.`,
      ``,
      `💡 *How to report an issue or request service:*`,
      `Simply type your request or complaint. For example:`,
      `• _"The air conditioning in Room 204 is making a loud buzzing noise."_`,
      `• _"We need extra bath towels and pillows in Suite 301."_`,
      `• _"There is water leaking under the bathroom vanity in Room 102."_`,
      ``,
      `Our AI system immediately creates a ticket, alerts the required department, and dispatches staff.`,
    ].join('\n');

    await this.bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
  }

  /**
   * Send Status of active ticket
   */
  async sendStatusMessage(chatId) {
    const session = this.chatSessions.get(chatId);
    if (!session || !session.lastIncidentId) {
      await this.bot.sendMessage(chatId, 'ℹ️ You do not have any active service requests on file.');
      return;
    }

    const incident = incidentService.getById(session.lastIncidentId);
    if (!incident) {
      await this.bot.sendMessage(chatId, 'ℹ️ Ticket details could not be retrieved.');
      return;
    }

    const statusMsg = [
      `📋 *Ticket Status: #${incident.id}*`,
      `• *Status:* ${incident.status.toUpperCase()}`,
      `• *Department:* ${this.formatDepartment(incident.department)}`,
      `• *Room:* ${incident.room_id || session.roomNumber}`,
      `• *Reported:* ${new Date(incident.reported_at).toLocaleTimeString()}`,
      `• *Details:* ${incident.title}`,
    ].join('\n');

    await this.bot.sendMessage(chatId, statusMsg, { parse_mode: 'Markdown' });
  }

  /**
   * Stop bot polling (for clean shutdowns)
   */
  async stopBot() {
    if (this.bot && this.isInitialized) {
      try {
        await this.bot.stopPolling();
        console.log('[TelegramService] Bot polling stopped.');
      } catch (err) {
        console.warn('[TelegramService] Error stopping bot polling:', err.message);
      }
      this.bot = null;
      this.isInitialized = false;
    }
  }
}

module.exports = new TelegramService();
