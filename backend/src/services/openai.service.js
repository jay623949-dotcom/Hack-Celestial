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
  console.warn('[OpenAIService] Warning: Could not pre-compile schemas:', err.message);
}

class OpenAIService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  initClient() {
    if (config.openai.apiKey) {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
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
      // Basic fallback validation if schema compiler failed
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
   * Execute Operational Context Analysis via OpenAI Responses API
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

    // 2. Check OpenAI API Configuration
    if (!this.client) {
      this.initClient();
    }

    if (!config.openai.apiKey) {
      const error = new Error('OpenAI API key is not configured on the server. Please set OPENAI_API_KEY in backend environment.');
      error.code = 'AI_KEY_MISSING';
      error.status = 503;
      throw error;
    }

    // 3. Invoke OpenAI Responses API
    const userPrompt = `Analyze the following resort operational context and produce a coordinated operational assessment:\n\n${JSON.stringify(context, null, 2)}`;

    let responseContent = null;

    try {
      // Use Responses API (client.responses.create) supported in modern openai SDK
      if (this.client.responses && typeof this.client.responses.create === 'function') {
        const response = await this.client.responses.create({
          model: config.openai.model || 'gpt-4o-mini',
          instructions: SYSTEM_INSTRUCTIONS,
          input: userPrompt,
          temperature: 0.2,
        });

        // Extract response output text
        if (response.output_text) {
          responseContent = response.output_text;
        } else if (response.output && Array.isArray(response.output)) {
          const textBlock = response.output.find((o) => o.type === 'message');
          responseContent = textBlock?.content?.[0]?.text || null;
        }
      } else {
        // Fallback for chat completions interface
        const chatCompletion = await this.client.chat.completions.create({
          model: config.openai.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTIONS },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });
        responseContent = chatCompletion.choices[0]?.message?.content;
      }
    } catch (apiError) {
      console.error('[OpenAIService] OpenAI API call failed:', apiError.message);
      const error = new Error(apiError.message || 'Error communicating with OpenAI');
      error.code = 'AI_SERVICE_ERROR';
      error.status = apiError.status || 502;
      throw error;
    }

    if (!responseContent) {
      const error = new Error('Empty response received from OpenAI service');
      error.code = 'AI_EMPTY_RESPONSE';
      error.status = 502;
      throw error;
    }

    // 4. Parse Structured JSON
    let parsedData = null;
    try {
      parsedData = JSON.parse(responseContent);
    } catch (parseErr) {
      console.error('[OpenAIService] Failed to parse model output as JSON:', responseContent);
      const error = new Error('AI returned non-JSON or malformed output');
      error.code = 'AI_INVALID_RESPONSE';
      error.status = 502;
      throw error;
    }

    // Normalize agent property to match schema ("operations" or domain enum)
    if (!parsedData.agent) {
      parsedData.agent = 'operations';
    }
    if (!parsedData.schema_version) {
      parsedData.schema_version = '1.0';
    }

    // 5. Validate AI Output Schema
    const outputValidation = this.validateAIOutput(parsedData);
    if (!outputValidation.valid) {
      console.error('[OpenAIService] AI output schema validation failed:', outputValidation.errors);
      const error = new Error(`AI returned invalid schema structure: ${outputValidation.errors.join(', ')}`);
      error.code = 'AI_INVALID_RESPONSE';
      error.status = 502;
      throw error;
    }

    return parsedData;
  }
}

module.exports = new OpenAIService();
