const contextBuilder = require('./context-builder.service');
const agentService = require('./agent.service');
const consensusService = require('./consensus.service');
const openAIService = require('./openai.service');

/**
 * OrchestratorService
 * Orchestrates the end-to-end multi-agent pipeline:
 * 1. Build canonical context from DB state or direct input.
 * 2. Execute requested departmental agents with error boundary isolation.
 * 3. Handle agent failures gracefully (without aborting the whole run).
 * 4. Pass canonical context, valid agent responses, and agent statuses to Consensus Service.
 * 5. Validate the structured consensus response and return normalized output.
 */
class OrchestratorService {
  /**
   * Run end-to-end multi-agent consensus orchestration
   * @param {Object} options
   * @param {Object} [options.trigger] - Trigger object to build context from database
   * @param {Object} [options.context] - Pre-built canonical context
   * @param {Array<string>} [options.agents] - Array of departmental agents to run
   * @returns {Promise<Object>} Coordinated orchestration result
   */
  async orchestrateConsensus(options = {}) {
    const startTime = Date.now();

    // 1. Build or Retrieve Canonical Context
    let canonicalContext = options.context;
    if (!canonicalContext) {
      const trigger = options.trigger || { type: 'multiple_incidents' };
      console.log('[OrchestratorService] Building canonical context for trigger:', trigger.type);
      canonicalContext = await contextBuilder.buildContext(trigger);
    }

    // Validate Context Schema
    const contextValidation = openAIService.validateInputContext(canonicalContext);
    if (!contextValidation.valid) {
      const error = new Error(`Operational context validation failed: ${contextValidation.errors.join(', ')}`);
      error.code = 'INVALID_CONTEXT';
      error.status = 400;
      error.details = contextValidation.errors;
      throw error;
    }

    // 2. Determine Agents to Run
    const supportedAgents = agentService.getSupportedAgents();
    let agentsToRun = Array.isArray(options.agents) && options.agents.length > 0
      ? options.agents.map((a) => String(a).toLowerCase().trim())
      : supportedAgents;

    // Filter against unknown agent names
    const unknownAgents = agentsToRun.filter((a) => !supportedAgents.includes(a));
    if (unknownAgents.length > 0) {
      const error = new Error(`Unknown agent requested: ${unknownAgents.join(', ')}. Supported agents: ${supportedAgents.join(', ')}`);
      error.code = 'UNKNOWN_AGENT';
      error.status = 400;
      throw error;
    }

    console.log(`[OrchestratorService] Executing ${agentsToRun.length} agents: ${agentsToRun.join(', ')}`);

    // 3. Execute Departmental Agents with Error Boundaries
    const agentExecutionResults = await agentService.runBatchAgents(agentsToRun, canonicalContext);

    // 4. Synthesize Multi-Agent Consensus
    console.log('[OrchestratorService] Passing results to Consensus Service...');
    const consensusResult = await consensusService.synthesizeConsensus(
      canonicalContext,
      agentExecutionResults
    );

    // 5. Structure Standardized API Response
    const responsePayload = {
      context_id: canonicalContext.context_id,
      trigger: canonicalContext.trigger,
      duration_ms: Date.now() - startTime,
      agents: agentExecutionResults.map((r) => ({
        agent: r.agent,
        status: r.status,
        duration_ms: r.duration_ms,
        recommendation_count: r.data?.recommendations?.length || 0,
        confidence: r.data?.confidence || (r.status === 'completed' ? 0.85 : 0.0),
        data: r.data || null,
        error: r.error || null,
      })),
      consensus: consensusResult,
    };

    return responsePayload;
  }
}

module.exports = new OrchestratorService();
