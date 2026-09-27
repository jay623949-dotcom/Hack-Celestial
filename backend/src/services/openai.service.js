const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { SYSTEM_INSTRUCTIONS } = require('../ai/prompts/operations-analysis.prompt');

// Load schemas for input & output validation
const ajv = new Ajv2020({ allErrors: true, coerceTypes: true });
addFormats(ajv);

const contextSchemaPath = path.join(__dirname, '..', '..', '..', 'schemas', 'ai', 'agent-context.schema.json');
const responseSchemaPath = path.join(__dirname, '..', '..', '..', 'schemas', 'ai', 'agent-response.schema.json');

let validateContext = null;
let validateResponse = null;

try {
  const contextSchema = JSON.parse(fs.readFileSync(contextSchemaPath, 'utf8'));
  const responseSchema = JSON.parse(fs.readFileSync(responseSchemaPath, 'utf8'));
  validateContext = ajv.compile(contextSchema);
  validateResponse = ajv.compile(responseSchema);
} catch (err) {
  console.warn('[AIService] Warning: Could not pre-compile schemas:', err.message);
}

/**
 * Universal AI Service Adapter
 * Pluggable provider architecture supporting:
 * 1. Google Gemini (free tier via @google/genai SDK)
 * 2. OpenAI API (gpt-4o-mini / gpt-4o)
 * 3. Local / Self-hosted LLMs (Ollama, LM Studio, vLLM via OpenAI-compatible endpoints)
 */
class AIService {
  constructor() {
    this.geminiClient = null;
    this.openaiClient = null;
    this.localClient = null;
    this.gemmaClient = null;
    this.initClients();
  }

  initClients() {
    // 1. Initialize Gemini
    const geminiKey = config.ai?.gemini?.apiKey || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
      } catch (e) {
        console.warn('[AIService] Failed to initialize GoogleGenAI client:', e.message);
      }
    }

    // 2. Initialize OpenAI
    const openAIKey = config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY;
    if (openAIKey) {
      try {
        this.openaiClient = new OpenAI({
          apiKey: openAIKey,
          baseURL: config.ai?.openai?.baseURL || undefined,
        });
      } catch (e) {
        console.warn('[AIService] Failed to initialize OpenAI client:', e.message);
      }
    }

    // 3. Initialize Gemma 2 / Local LLM Client (OpenAI-compatible client pointing to localhost/Ollama or remote)
    const gemmaBaseURL = config.ai?.gemma?.baseURL || config.ai?.local?.baseURL || process.env.LOCAL_AI_BASE_URL || 'http://localhost:11434/v1';
    try {
      this.gemmaClient = new OpenAI({
        apiKey: config.ai?.gemma?.apiKey || 'local-no-key-required',
        baseURL: gemmaBaseURL,
        timeout: 10000, // 10s fast timeout for unreachable detection
        maxRetries: 0,   // Don't retry on local — fail fast and fallback to NuGen
      });
      this.localClient = this.gemmaClient;
    } catch (e) {
      console.warn('[AIService] Failed to initialize Gemma 2 client:', e.message);
    }
  }

  /**
   * Determine active provider with intelligent fallback
   */
  getActiveProvider() {
    const configured = (config.ai?.provider || process.env.AI_PROVIDER || 'gemma2').toLowerCase();

    // Gemma 2 is primary choice (with auto-fallback to NuGen when unreachable)
    if (configured === 'gemma2' || configured === 'gemma' || configured === 'local') {
      return 'gemma2';
    }

    // Direct NuGen Domain AI
    if (configured === 'nugen') {
      return 'nugen';
    }

    // If configured provider has credentials/connection, use it
    if (configured === 'gemini' && (config.ai?.gemini?.apiKey || process.env.GEMINI_API_KEY)) {
      return 'gemini';
    }
    if (configured === 'openai' && (config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY)) {
      return 'openai';
    }

    return 'gemma2';
  }

  /**
   * Compress full canonical context into a compact summary for small local models.
   * Full context can be 6000-10000 tokens — too large for gemma2:2b (4k ctx window).
   * This strips it to ~1200 tokens covering only operationally critical data.
   */
  compressContextForLocalModel(context) {
    const rooms = Array.isArray(context.rooms) ? context.rooms : [];
    const staff = Array.isArray(context.staff) ? context.staff : [];
    const incidents = Array.isArray(context.incidents) ? context.incidents : [];
    const guests = Array.isArray(context.guests) ? context.guests : [];

    // Only include high-priority incidents
    const criticalIncidents = incidents
      .filter(i => i.severity === 'critical' || i.priority === 'critical' || i.status === 'open')
      .slice(0, 4)
      .map(i => ({ id: i.id, title: i.title || i.type, severity: i.severity, room: i.room_id, status: i.status }));

    // Only occupied/checkout rooms
    const relevantRooms = rooms
      .filter(r => ['occupied', 'checkout', 'dirty', 'maintenance'].includes(r.status))
      .slice(0, 10)
      .map(r => ({ id: r.id, number: r.number, status: r.status, type: r.type }));

    // Available staff by department
    const availableStaff = staff
      .filter(s => s.status === 'available' || s.status === 'on_duty')
      .slice(0, 6)
      .map(s => ({ id: s.id, name: s.name, department: s.department, status: s.status }));

    // VIP guests only
    const vipGuests = guests
      .filter(g => g.vip === true || g.vip_tier)
      .slice(0, 5)
      .map(g => ({ id: g.id, name: g.name, vip_tier: g.vip_tier, room_id: g.room_id }));

    return {
      context_id: context.context_id,
      schema_version: context.schema_version,
      created_at: context.created_at,
      resort: context.resort,
      trigger: context.trigger,
      rooms_summary: {
        total: rooms.length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        available: rooms.filter(r => r.status === 'available').length,
        relevant_rooms: relevantRooms,
      },
      staff_summary: {
        total: staff.length,
        available: availableStaff,
      },
      incidents: criticalIncidents,
      vip_guests: vipGuests,
    };
  }

  /**
   * Validate canonical operational context
   * @param {Object} context 
   */
  validateInputContext(context) {
    if (!context || typeof context !== 'object') {
      return { valid: false, errors: ['Context must be a non-null object.'] };
    }

    if (validateContext) {
      const isValid = validateContext(context);
      if (!isValid) {
        const errorMsgs = (validateContext.errors || []).map(
          (e) => `${e.instancePath || 'root'} ${e.message}`
        );
        return { valid: false, errors: errorMsgs };
      }
    } else {
      const requiredFields = ['context_id', 'schema_version', 'created_at', 'resort', 'trigger', 'rooms', 'staff', 'incidents'];
      for (const field of requiredFields) {
        if (!context[field]) {
          return { valid: false, errors: [`Missing required field: ${field}`] };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Validate AI output response against agent-response schema
   * @param {Object} aiResponse 
   */
  validateAIOutput(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'object') {
      return { valid: false, errors: ['AI output must be a non-null JSON object.'] };
    }

    if (validateResponse) {
      const isValid = validateResponse(aiResponse);
      if (!isValid) {
        const errorMsgs = (validateResponse.errors || []).map(
          (e) => `${e.instancePath || 'root'} ${e.message}`
        );
        return { valid: false, errors: errorMsgs };
      }
    } else {
      const required = ['agent', 'schema_version', 'assessment', 'observations', 'constraints', 'recommendations', 'confidence'];
      for (const req of required) {
        if (aiResponse[req] === undefined) {
          return { valid: false, errors: [`AI response missing field: ${req}`] };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Invoke Gemini Model via official @google/genai SDK
   */
  async callGemini(userPrompt, systemInstructions = SYSTEM_INSTRUCTIONS) {
    if (!this.geminiClient) this.initClients();

    const apiKey = config.ai?.gemini?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const error = new Error('Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env (Get a free key at https://aistudio.google.com).');
      error.code = 'AI_KEY_MISSING';
      error.status = 503;
      throw error;
    }

    const modelName = config.ai?.gemini?.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`[AIService] Calling Google Gemini model (${modelName}) [Attempt ${attempt}/${maxRetries}]...`);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const err = new Error('Gemini API call timed out after 45s');
            err.code = 'AI_TIMEOUT';
            err.status = 504;
            reject(err);
          }, 45000);
        });

        const generatePromise = this.geminiClient.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstructions}\n\nStrict JSON only. Respond with a valid JSON object matching the requested schema.\n\n${userPrompt}` }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);
        return response.text;
      } catch (err) {
        if (err.code === 'AI_TIMEOUT') {
          throw err;
        }
        const isTransient = err.message.includes('503') || err.message.includes('429') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE') || err.message.includes('RESOURCE_EXHAUSTED');
        if (isTransient && attempt < maxRetries) {
          // Check if error specifies retryDelay
          let delayMs = attempt * 3500;
          const match = err.message.match(/retry in ([0-9.]+)/i);
          if (match && match[1]) {
            delayMs = Math.max(delayMs, (parseFloat(match[1]) + 0.5) * 1000);
          }
          console.warn(`[AIService] Gemini transient capacity spike. Retrying in ${Math.round(delayMs)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          console.error('[AIService] Gemini API error:', err.message);
          const error = new Error(`Gemini API error: ${err.message}`);
          error.code = 'AI_SERVICE_ERROR';
          error.status = 502;
          throw error;
        }
      }
    }
  }

  /**
   * Invoke OpenAI or Local Model via OpenAI SDK
   */
  async callOpenAICompatible(client, model, userPrompt, providerLabel, systemInstructions = SYSTEM_INSTRUCTIONS, timeoutMs = 45000) {
    console.log(`[AIService] Calling ${providerLabel} model (${model})...`);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error(`${providerLabel} call timed out after ${Math.round(timeoutMs / 1000)}s`);
        err.code = 'AI_TIMEOUT';
        err.status = 504;
        reject(err);
      }, timeoutMs);
    });

    try {
      // Modern Responses API check
      if (client.responses && typeof client.responses.create === 'function' && providerLabel === 'OpenAI') {
        const responsePromise = client.responses.create({
          model,
          instructions: systemInstructions,
          input: userPrompt,
          temperature: 0.2,
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);
        if (response.output_text) return response.output_text;
        if (response.output && Array.isArray(response.output)) {
          const textBlock = response.output.find((o) => o.type === 'message');
          return textBlock?.content?.[0]?.text || null;
        }
      }

      // Standard Chat Completions (works for OpenAI, Ollama, LM Studio, vLLM)
      const completionParams = {
        model,
        messages: [
          { role: 'system', content: `${systemInstructions}\n\nCRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no prose, no code fences. Start your response with { and end with }.` },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        stream: false,
      };
      if (providerLabel === 'OpenAI') {
        completionParams.response_format = { type: 'json_object' };
      }
      const chatCompletionPromise = client.chat.completions.create(completionParams);
      const chatCompletion = await Promise.race([chatCompletionPromise, timeoutPromise]);

      const rawContent = chatCompletion.choices[0]?.message?.content || '';
      if (rawContent.startsWith('```')) {
        return rawContent.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
      }
      return rawContent;
    } catch (err) {
      if (err.code === 'AI_TIMEOUT') {
        throw err;
      }
      console.warn(`[AIService] ${providerLabel} API error:`, err.message);
      const error = new Error(`${providerLabel} API error: ${err.message}`);
      error.code = 'AI_SERVICE_ERROR';
      error.status = err.status || 502;
      throw error;
    }
  }

  /**
   * Dedicated Gemma 2 caller with fast timeout for reachability detection
   */
  async callGemma2(userPrompt, systemInstructions = SYSTEM_INSTRUCTIONS) {
    if (!this.gemmaClient) this.initClients();
    const model = config.ai?.gemma?.model || config.ai?.local?.model || process.env.LOCAL_AI_MODEL || 'gemma2:2b';
    return await this.callOpenAICompatible(this.gemmaClient, model, userPrompt, 'Gemma 2', systemInstructions, 10000);
  }

  /**
   * Invoke NuGen Domain Intelligence inference
   */
  async callNugen(context) {
    console.log('[NUGEN] Preparing Resort 360 context for domain inference');
    const nugenInferenceService = require('./nugen/nugenInferenceService');
    const modelId = nugenInferenceService.getModelId();
    console.log(`[NUGEN] Using aligned Resort 360 model (${modelId})`);
    console.log('[NUGEN] Inference started');
    const nugenResult = await nugenInferenceService.analyzeResortIncident(context);
    console.log('[NUGEN] Domain intelligence inference completed');

    return this.formatNugenResponse(nugenResult, context);
  }

  /**
   * Format NuGen Domain Decision into standard agent response schema
   */
  formatNugenResponse(nugenResult, context) {
    const mappedResponse = {
      agent: 'operations',
      schema_version: '1.0',
      assessment: {
        summary: nugenResult.summary,
        priority: (nugenResult.severity || 'high').toLowerCase(),
      },
      observations: [
        `Incident ${nugenResult.incident_id}: ${nugenResult.summary}`,
        ...(nugenResult.impact || []),
      ],
      constraints: nugenResult.dependencies || [],
      recommendations: (nugenResult.recommended_actions || []).map((a, idx) => ({
        recommendation_id: `rec-nugen-${idx + 1}`,
        action: a.action,
        reason: a.reason,
        priority: (a.priority || 'high').toLowerCase(),
        affected_rooms: context.rooms?.map((r) => r.id).slice(0, 2) || ['room-401'],
        affected_guests: context.guests?.map((g) => g.id).slice(0, 1) || ['guest-001'],
        required_staff: context.staff?.filter((s) => s.department === a.department).map((s) => s.id) || [],
        estimated_duration_minutes: 20,
        risks: ['Cross-departmental coordination requirement'],
        confidence: (nugenResult.confidence_score || 95) / 100,
      })),
      confidence: (nugenResult.confidence_score || 95) / 100,
      nugen_domain_intelligence: nugenResult,
      model_source: nugenResult.is_fallback ? 'nugen-domain-fallback' : 'nugen-aligned-model',
    };

    const outputValidation = this.validateAIOutput(mappedResponse);
    if (!outputValidation.valid) {
      console.warn('[AIService] NuGen output normalization schema warning:', outputValidation.errors);
    } else {
      console.log('[NUGEN] Structured response validated');
    }
    return mappedResponse;
  }

  /**
   * Helper to clean markdown fences and parse valid JSON
   */
  cleanAndParseJSON(rawContent) {
    let cleaned = String(rawContent || '').trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
    }
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    return JSON.parse(cleaned);
  }

  /**
   * Execute Operational Context Analysis with Gemma 2 -> NuGen Fallback
   * @param {Object} context Canonical operational context snapshot
   * @returns {Promise<Object>} Structured analysis response
   */
  async analyzeContext(context) {
    // 1. Validate Input Context
    const inputValidation = this.validateInputContext(context);
    if (!inputValidation.valid) {
      const error = new Error(`Invalid operational context: ${inputValidation.errors.join(', ')}`);
      error.code = 'INVALID_CONTEXT';
      error.status = 400;
      throw error;
    }

    const provider = this.getActiveProvider();

    // 2. Primary Route: Gemma 2 (Auto-fallback to NuGen if Gemma API is not reachable)
    if (provider === 'gemma2' || provider === 'gemma' || provider === 'local') {
      try {
        console.log(`[AIService] Routing to primary model: Gemma 2 (${config.ai?.gemma?.model || 'gemma2:2b'})...`);
        const contextForModel = this.compressContextForLocalModel(context);
        const userPrompt = `Analyze the following resort operational context and produce a coordinated operational assessment:\n\n${JSON.stringify(contextForModel, null, 2)}`;
        const gemmaRaw = await this.callGemma2(userPrompt);
        const parsed = this.cleanAndParseJSON(gemmaRaw);
        if (!parsed.agent) parsed.agent = 'operations';
        if (!parsed.schema_version) parsed.schema_version = '1.0';
        return parsed;
      } catch (gemmaErr) {
        console.warn(`[AIService] Gemma 2 API not reachable (${gemmaErr.message}). Seamlessly falling back to NuGen Domain Intelligence...`);
        return await this.callNugen(context);
      }
    }

    // 3. NuGen Provider Route
    if (provider === 'nugen') {
      try {
        return await this.callNugen(context);
      } catch (nugenErr) {
        console.warn(`[AIService] NuGen inference failed (${nugenErr.message}). Attempting Gemma 2 fallback...`);
        try {
          const contextForModel = this.compressContextForLocalModel(context);
          const userPrompt = `Analyze the following resort operational context and produce a coordinated operational assessment:\n\n${JSON.stringify(contextForModel, null, 2)}`;
          const gemmaRaw = await this.callGemma2(userPrompt);
          return this.cleanAndParseJSON(gemmaRaw);
        } catch (gemmaErr) {
          console.warn('[AIService] Gemma 2 also unreachable. Using NuGen deterministic domain fallback.');
          const nugenInferenceService = require('./nugen/nugenInferenceService');
          const compact = nugenInferenceService.buildPromptContext(context);
          const fallbackResult = nugenInferenceService.getDeterministicDomainFallback(compact);
          return this.formatNugenResponse(fallbackResult, context);
        }
      }
    }

    // 4. Gemini Route
    if (provider === 'gemini') {
      try {
        const userPrompt = `Analyze the following resort operational context and produce a coordinated operational assessment:\n\n${JSON.stringify(context, null, 2)}`;
        const raw = await this.callGemini(userPrompt);
        return this.cleanAndParseJSON(raw);
      } catch (geminiErr) {
        console.warn(`[AIService] Gemini failed (${geminiErr.message}). Falling back to NuGen...`);
        return await this.callNugen(context);
      }
    }

    // 5. OpenAI Route
    if (!this.openaiClient) this.initClients();
    const apiKey = config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[AIService] No OpenAI key. Falling back to NuGen Domain Intelligence...');
      return await this.callNugen(context);
    }
    const model = config.ai?.openai?.model || config.openai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const userPrompt = `Analyze the following resort operational context and produce a coordinated operational assessment:\n\n${JSON.stringify(context, null, 2)}`;
    const responseContent = await this.callOpenAICompatible(this.openaiClient, model, userPrompt, 'OpenAI');
    return this.cleanAndParseJSON(responseContent);
  }

  /**
   * Universal completion executor: Gemma 2 -> NuGen Fallback -> Gemini -> Domain Grounding
   */
  async executeCompletion(userPrompt, systemInstructions = SYSTEM_INSTRUCTIONS) {
    const provider = this.getActiveProvider();
    let responseContent = null;

    // 1. Try Gemma 2 first if requested
    if (provider === 'gemma2' || provider === 'gemma' || provider === 'local') {
      try {
        console.log(`[AIService] Executing completion via Gemma 2 (${config.ai?.gemma?.model || 'gemma2:2b'})...`);
        responseContent = await this.callGemma2(userPrompt, systemInstructions);
      } catch (gemmaErr) {
        console.warn(`[AIService] Gemma 2 API not reachable (${gemmaErr.message}). Seamlessly falling back to NuGen...`);
      }
    }

    // 2. Try NuGen
    if (!responseContent) {
      const apiKey = config.ai?.nugen?.apiKey || process.env.NUGEN_API_KEY;
      if (apiKey) {
        try {
          const baseUrl = (config.ai?.nugen?.baseURL || process.env.NUGEN_BASE_URL || 'https://api.nugen.in').replace(/\/+$/, '');
          const model = config.ai?.nugen?.modelId || process.env.NUGEN_MODEL_ID || 'resort360-hospitality-v1';
          console.log(`[NUGEN] Executing completion using aligned model: ${model}`);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const nugenRes = await fetch(`${baseUrl}/api/v3/inference/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemInstructions },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.2,
              max_tokens: 1500,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (nugenRes.ok) {
            const data = await nugenRes.json();
            responseContent = data.choices?.[0]?.message?.content || data.text || '';
          }
        } catch (e) {
          console.warn('[NUGEN] Inference failed for completion:', e.message);
        }
      }
    }

    // 3. Try Gemini fallback
    if (!responseContent && (config.ai?.gemini?.apiKey || process.env.GEMINI_API_KEY)) {
      try {
        responseContent = await this.callGemini(userPrompt, systemInstructions);
      } catch (e) {
        console.warn('[AIService] Gemini fallback failed:', e.message);
      }
    }

    // 4. Try OpenAI fallback
    if (!responseContent && (config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY)) {
      try {
        if (!this.openaiClient) this.initClients();
        const model = config.ai?.openai?.model || config.openai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
        responseContent = await this.callOpenAICompatible(this.openaiClient, model, userPrompt, 'OpenAI', systemInstructions);
      } catch (e) {
        console.warn('[AIService] OpenAI fallback failed:', e.message);
      }
    }

    // 5. Ultimate domain-grounded fallback (app never crashes)
    if (!responseContent) {
      console.warn('[AIService] All external AI APIs offline or unreachable. Returning domain-grounded operational fallback.');
      return {
        agent: 'operations',
        schema_version: '1.0',
        assessment: {
          summary: 'Domain fallback: prioritized incident assessment and task sequencing.',
          priority: 'high',
        },
        observations: ['AI live endpoint offline; domain fallback applied.'],
        constraints: ['Verify work order before assignment.'],
        recommendations: [
          {
            recommendation_id: 'rec-fallback-01',
            action: 'Dispatch on-duty staff to inspect and report incident status.',
            reason: 'Grounds operational continuity when external AI services are unreachable.',
            priority: 'high',
            confidence: 0.92,
          }
        ],
        confidence: 0.92,
        is_fallback: true,
      };
    }

    return this.cleanAndParseJSON(responseContent);
  }
}

module.exports = new AIService();
