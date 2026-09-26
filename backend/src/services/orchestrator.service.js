const contextBuilder = require("./context-builder.service");
const agentService = require("./agent.service");
const consensusService = require("./consensus.service");
const openAIService = require("./openai.service");
const aiPersistence = require("./ai-persistence.service");

class OrchestratorService {
  async orchestrateConsensus(options = {}) {
    const startTime = Date.now();

    let canonicalContext = options.context;
    if (!canonicalContext) {
      const trigger = options.trigger || { type: "multiple_incidents" };
      console.log("[OrchestratorService] Building canonical context for trigger:", trigger.type);
      canonicalContext = await contextBuilder.buildContext(trigger);
    }

    const contextValidation = openAIService.validateInputContext(canonicalContext);
    if (!contextValidation.valid) {
      const error = new Error(`Operational context validation failed: ${contextValidation.errors.join(", ")}`);
      error.code = "INVALID_CONTEXT";
      error.status = 400;
      error.details = contextValidation.errors;
      throw error;
    }

    const supportedAgents = agentService.getSupportedAgents();
    let agentsToRun = Array.isArray(options.agents) && options.agents.length > 0
      ? options.agents.map((a) => String(a).toLowerCase().trim())
      : supportedAgents;

    const unknownAgents = agentsToRun.filter((a) => !supportedAgents.includes(a));
    if (unknownAgents.length > 0) {
      const error = new Error(`Unknown agent requested: ${unknownAgents.join(", ")}. Supported: ${supportedAgents.join(", ")}`);
      error.code = "UNKNOWN_AGENT";
      error.status = 400;
      throw error;
    }

    const runId = canonicalContext.context_id;
    const provider = openAIService.getActiveProvider();
    aiPersistence.createRun({
      runId,
      contextId: canonicalContext.context_id,
      triggerType: canonicalContext.trigger?.type || "manual",
      triggerPayload: canonicalContext.trigger || {},
      provider,
    }).catch(e => console.warn("[OrchestratorService] Persistence createRun warning:", e.message));

    console.log(`[OrchestratorService] Executing ${agentsToRun.length} agents: ${agentsToRun.join(", ")}`);
    const agentExecutionResults = await agentService.runBatchAgents(agentsToRun, canonicalContext);

    console.log("[OrchestratorService] Passing results to Consensus Service...");
    const consensusResult = await consensusService.synthesizeConsensus(canonicalContext, agentExecutionResults);

    const responsePayload = {
      run_id: runId,
      context_id: canonicalContext.context_id,
      trigger: canonicalContext.trigger,
      duration_ms: Date.now() - startTime,
      agents: agentExecutionResults.map((r) => ({
        agent: r.agent,
        status: r.status,
        duration_ms: r.duration_ms,
        recommendation_count: r.data?.recommendations?.length || 0,
        confidence: r.data?.confidence || (r.status === "completed" ? 0.85 : 0.0),
        data: r.data || null,
        error: r.error || null,
      })),
      consensus: consensusResult,
    };

    aiPersistence.persistOrchestrationResult({ runId, payload: responsePayload })
      .catch(e => console.warn("[OrchestratorService] Persistence warning:", e.message));

    return responsePayload;
  }
}

module.exports = new OrchestratorService();