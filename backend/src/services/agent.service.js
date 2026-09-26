const openAIService = require('./openai.service');
const frontDeskPrompt = require('../ai/prompts/front-desk.prompt');
const housekeepingPrompt = require('../ai/prompts/housekeeping.prompt');
const maintenancePrompt = require('../ai/prompts/maintenance.prompt');
const revenuePrompt = require('../ai/prompts/revenue.prompt');

/**
 * Registry of Supported Domain Agents
 */
const AGENT_REGISTRY = {
  front_desk: {
    name: 'front_desk',
    promptVersion: frontDeskPrompt.PROMPT_VERSION,
    instructions: frontDeskPrompt.SYSTEM_INSTRUCTIONS,
    department: 'Front Desk',
  },
  housekeeping: {
    name: 'housekeeping',
    promptVersion: housekeepingPrompt.PROMPT_VERSION,
    instructions: housekeepingPrompt.SYSTEM_INSTRUCTIONS,
    department: 'Housekeeping',
  },
  maintenance: {
    name: 'maintenance',
    promptVersion: maintenancePrompt.PROMPT_VERSION,
    instructions: maintenancePrompt.SYSTEM_INSTRUCTIONS,
    department: 'Maintenance',
  },
  revenue: {
    name: 'revenue',
    promptVersion: revenuePrompt.PROMPT_VERSION,
    instructions: revenuePrompt.SYSTEM_INSTRUCTIONS,
    department: 'Revenue',
  },
};

const SUPPORTED_AGENTS = Object.keys(AGENT_REGISTRY);

/**
 * AgentService
 * Centralized agent execution service implementing Phase 2.3 requirements:
 * 1. Executes specialized domain agents against shared canonical operational context.
 * 2. Enforces agent isolation (no cross-contamination of recommendations).
 * 3. Enforces strict JSON Schema validation (/schemas/ai/agent-response.schema.json).
 * 4. Supports batch agent analysis with resilient per-agent error boundaries.
 */
class AgentService {
  /**
   * Return list of supported agent types
   */
  getSupportedAgents() {
    return [...SUPPORTED_AGENTS];
  }

  /**
   * Execute analysis for a single domain agent
   * @param {string} agentType - 'front_desk' | 'housekeeping' | 'maintenance' | 'revenue'
   * @param {Object} context - Canonical operational context
   * @returns {Promise<Object>} Validated agent output
   */
  async runAgent(agentType, context) {
    const normalizedType = String(agentType).toLowerCase().trim();
    const agentConfig = AGENT_REGISTRY[normalizedType];

    if (!agentConfig) {
      const error = new Error(`Unsupported agent type "${agentType}". Supported types: ${SUPPORTED_AGENTS.join(', ')}`);
      error.code = 'UNKNOWN_AGENT';
      error.status = 400;
      throw error;
    }

    // 1. Validate Context Input
    const contextValidation = openAIService.validateInputContext(context);
    if (!contextValidation.valid) {
      const error = new Error(`Invalid operational context: ${contextValidation.errors.join(', ')}`);
      error.code = 'INVALID_CONTEXT';
      error.status = 400;
      throw error;
    }

    const userPrompt = `Analyze the following canonical operational context strictly from your domain perspective as ${agentConfig.department} Operations Analyst (prompt_version: ${agentConfig.promptVersion}):\n\n${JSON.stringify(context, null, 2)}`;

    console.log(`[AgentService] Running ${agentConfig.department} Agent (${agentConfig.promptVersion})...`);

    // 2. Execute via Universal AI Service Adapter
    let rawOutput = null;
    try {
      rawOutput = await openAIService.executeCompletion(userPrompt, agentConfig.instructions);
    } catch (err) {
      console.error(`[AgentService] Error running agent "${agentType}":`, err.message);
      const error = new Error(`Agent execution failed for ${agentType}: ${err.message}`);
      error.code = err.code || 'AGENT_EXECUTION_FAILED';
      error.status = err.status || 502;
      throw error;
    }

    // 3. Normalize Agent Name & Schema Version
    if (!rawOutput.agent || rawOutput.agent !== normalizedType) {
      rawOutput.agent = normalizedType;
    }
    if (!rawOutput.schema_version) {
      rawOutput.schema_version = '1.0';
    }

    // Ensure observations is an array of strings (per agent-response.schema.json)
    if (Array.isArray(rawOutput.observations)) {
      rawOutput.observations = rawOutput.observations.map((obs) => {
        if (typeof obs === 'object' && obs !== null) {
          return obs.description || obs.text || JSON.stringify(obs);
        }
        return String(obs);
      });
    }

    // Ensure constraints is an array of strings
    if (Array.isArray(rawOutput.constraints)) {
      rawOutput.constraints = rawOutput.constraints.map((c) => {
        if (typeof c === 'object' && c !== null) {
          return c.description || c.text || JSON.stringify(c);
        }
        return String(c);
      });
    }

    // Ensure confidence is clamped between 0 and 1
    if (typeof rawOutput.confidence === 'number') {
      rawOutput.confidence = Math.max(0.0, Math.min(1.0, rawOutput.confidence));
    }

    // 4. Validate output schema strictly
    const outputValidation = openAIService.validateAIOutput(rawOutput);
    if (!outputValidation.valid) {
      console.error(`[AgentService] Schema validation failed for agent "${agentType}":`, outputValidation.errors);
      const error = new Error(`Agent returned an invalid structured response: ${outputValidation.errors.join(', ')}`);
      error.code = 'AGENT_INVALID_OUTPUT';
      error.status = 502;
      error.details = outputValidation.errors;
      throw error;
    }

    return rawOutput;
  }

  /**
   * Batch execute multiple domain agents against identical canonical context
   * Runs isolated agents with per-agent error boundaries.
   * @param {Array<string>} agentTypes 
   * @param {Object} context 
   * @returns {Promise<Array<Object>>} Array of agent results with status
   */
  async runBatchAgents(agentTypes = SUPPORTED_AGENTS, context) {
    const requestedAgents = Array.isArray(agentTypes) && agentTypes.length > 0 
      ? agentTypes 
      : SUPPORTED_AGENTS;

    const results = [];

    // Run sequentially to maintain clean rate limit management and deterministic evaluation
    for (const agentType of requestedAgents) {
      const normalizedType = String(agentType).toLowerCase().trim();
      const startTime = Date.now();

      // Gentle pacing between agent invocations to respect free-tier rate limits (10-15 RPM)
      if (results.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }

      try {
        const agentOutput = await this.runAgent(normalizedType, context);
        results.push({
          agent: normalizedType,
          status: 'completed',
          duration_ms: Date.now() - startTime,
          data: agentOutput,
        });
      } catch (err) {
        results.push({
          agent: normalizedType,
          status: 'error',
          duration_ms: Date.now() - startTime,
          error: {
            code: err.code || 'AGENT_ERROR',
            message: err.message,
            details: err.details || null,
          },
        });
      }
    }

    return results;
  }
}

module.exports = new AgentService();
