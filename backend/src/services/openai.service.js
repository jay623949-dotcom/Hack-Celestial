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

    // 3. Initialize Local LLM Client (OpenAI-compatible client pointing to localhost/Ollama)
    const localBaseURL = config.ai?.local?.baseURL || process.env.LOCAL_AI_BASE_URL;
    if (localBaseURL) {
      try {
        this.localClient = new OpenAI({
          apiKey: 'local-no-key-required',
          baseURL: localBaseURL,
        });
      } catch (e) {
        console.warn('[AIService] Failed to initialize Local AI client:', e.message);
      }
    }
  }

  /**
   * Determine active provider with intelligent fallback
   */
  getActiveProvider() {
    const configured = (config.ai?.provider || process.env.AI_PROVIDER || 'gemini').toLowerCase();

    // If configured provider has credentials/connection, use it
    if (configured === 'gemini' && (config.ai?.gemini?.apiKey || process.env.GEMINI_API_KEY)) {
      return 'gemini';
    }
    if (configured === 'openai' && (config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY)) {
      return 'openai';
    }
    if (configured === 'local') {
      return 'local';
    }

    // Fallback: Check if OpenAI has key when Gemini doesn't
    if (config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY) {
      return 'openai';
    }
    if (config.ai?.gemini?.apiKey || process.env.GEMINI_API_KEY) {
      return 'gemini';
    }

    return configured;
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
        const response = await this.geminiClient.models.generateContent({
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

        return response.text;
      } catch (err) {
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
  async callOpenAICompatible(client, model, userPrompt, providerLabel, systemInstructions = SYSTEM_INSTRUCTIONS) {
    console.log(`[AIService] Calling ${providerLabel} model (${model})...`);

    try {
      // Modern Responses API check
      if (client.responses && typeof client.responses.create === 'function' && providerLabel === 'OpenAI') {
        const response = await client.responses.create({
          model,
          instructions: systemInstructions,
          input: userPrompt,
          temperature: 0.2,
        });

        if (response.output_text) return response.output_text;
        if (response.output && Array.isArray(response.output)) {
          const textBlock = response.output.find((o) => o.type === 'message');
          return textBlock?.content?.[0]?.text || null;
        }
      }

      // Standard Chat Completions (works for OpenAI, Ollama, LM Studio, vLLM)
      const chatCompletion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      return chatCompletion.choices[0]?.message?.content;
    } catch (err) {
      console.error(`[AIService] ${providerLabel} API error:`, err.message);
      const error = new Error(`${providerLabel} API error: ${err.message}`);
      error.code = 'AI_SERVICE_ERROR';
      error.status = err.status || 502;
      throw error;
    }
  }

  /**
   * Execute Operational Context Analysis via Universal Provider Adapter
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
    const userPrompt = `Analyze the following resort operational context and produce a coordinated operational assessment:\n\n${JSON.stringify(context, null, 2)}`;

    let responseContent = null;

    // 2. Route to Active Provider
    if (provider === 'gemini') {
      responseContent = await this.callGemini(userPrompt);
    } else if (provider === 'local') {
      if (!this.localClient) this.initClients();
      const model = config.ai?.local?.model || process.env.LOCAL_AI_MODEL || 'llama3.2';
      responseContent = await this.callOpenAICompatible(this.localClient, model, userPrompt, 'Local LLM');
    } else {
      // Default: OpenAI
      if (!this.openaiClient) this.initClients();
      const apiKey = config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const error = new Error('No AI provider configured. Please set GEMINI_API_KEY (free at https://aistudio.google.com) or OPENAI_API_KEY in backend/.env.');
        error.code = 'AI_KEY_MISSING';
        error.status = 503;
        throw error;
      }
      const model = config.ai?.openai?.model || config.openai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
      responseContent = await this.callOpenAICompatible(this.openaiClient, model, userPrompt, 'OpenAI');
    }

    if (!responseContent) {
      const error = new Error(`Empty response received from ${provider} model service`);
      error.code = 'AI_EMPTY_RESPONSE';
      error.status = 502;
      throw error;
    }

    // 3. Clean and parse JSON
    let parsedData = null;
    try {
      // Strip markdown code fences if model enclosed JSON in ```json ... ```
      let cleaned = responseContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
      }
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[AIService] Failed to parse model output as JSON:', responseContent);
      const error = new Error('AI returned non-JSON or malformed output');
      error.code = 'AI_INVALID_RESPONSE';
      error.status = 502;
      throw error;
    }

    // Normalize agent & version
    if (!parsedData.agent) parsedData.agent = 'operations';
    if (!parsedData.schema_version) parsedData.schema_version = '1.0';

    // 4. Validate AI Output Schema
    const outputValidation = this.validateAIOutput(parsedData);
    if (!outputValidation.valid) {
      console.error('[AIService] AI output schema validation failed:', outputValidation.errors);
      const error = new Error(`AI returned invalid schema structure: ${outputValidation.errors.join(', ')}`);
      error.code = 'AI_INVALID_RESPONSE';
      error.status = 502;
      throw error;
    }

    return parsedData;
  }

  /**
   * Universal completion executor accepting custom prompt, system instructions, and schema validation
   * @param {string} userPrompt 
   * @param {string} systemInstructions 
   * @returns {Promise<Object>} Cleaned, parsed, and validated JSON output
   */
  async executeCompletion(userPrompt, systemInstructions = SYSTEM_INSTRUCTIONS) {
    const provider = this.getActiveProvider();
    let responseContent = null;

    if (provider === 'gemini') {
      responseContent = await this.callGemini(userPrompt, systemInstructions);
    } else if (provider === 'local') {
      if (!this.localClient) this.initClients();
      const model = config.ai?.local?.model || process.env.LOCAL_AI_MODEL || 'llama3.2';
      responseContent = await this.callOpenAICompatible(this.localClient, model, userPrompt, 'Local LLM', systemInstructions);
    } else {
      if (!this.openaiClient) this.initClients();
      const apiKey = config.ai?.openai?.apiKey || config.openai?.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const error = new Error('No AI provider configured. Please set GEMINI_API_KEY (free at https://aistudio.google.com) or OPENAI_API_KEY in backend/.env.');
        error.code = 'AI_KEY_MISSING';
        error.status = 503;
        throw error;
      }
      const model = config.ai?.openai?.model || config.openai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
      responseContent = await this.callOpenAICompatible(this.openaiClient, model, userPrompt, 'OpenAI', systemInstructions);
    }

    if (!responseContent) {
      const error = new Error(`Empty response received from ${provider} model service`);
      error.code = 'AI_EMPTY_RESPONSE';
      error.status = 502;
      throw error;
    }

    // Clean and parse JSON
    let parsedData = null;
    try {
      let cleaned = responseContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
      }
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[AIService] Failed to parse model output as JSON:', responseContent);
      const error = new Error('AI returned non-JSON or malformed output');
      error.code = 'AI_INVALID_RESPONSE';
      error.status = 502;
      throw error;
    }

    return parsedData;
  }
}

module.exports = new AIService();
