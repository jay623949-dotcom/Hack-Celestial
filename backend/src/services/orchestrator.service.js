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

    // 1. Invoke Operational Intelligence Layer (Grok AI / Gemma 2)
    let domainAnalysis = null;
    try {
      console.log(`[ORCHESTRATOR] Invoking operational intelligence layer via ${provider}...`);
      domainAnalysis = await openAIService.analyzeContext(canonicalContext);
      canonicalContext.domain_intelligence = domainAnalysis;
      console.log(`[ORCHESTRATOR] Operational intelligence completed (Confidence: ${Math.round((domainAnalysis.confidence || 0.94) * 100)}%)`);
    } catch (aiErr) {
      console.warn('[ORCHESTRATOR] Operational intelligence fallback notice:', aiErr.message);
      domainAnalysis = openAIService.getDeterministicDomainResponse(canonicalContext);
    }

    // 2. Execute Specialized Departmental AI Agents with Shared Domain Context
    console.log(`[ORCHESTRATOR] Executing ${agentsToRun.length} agents: ${agentsToRun.join(", ")}`);
    const agentExecutionResults = await agentService.runBatchAgents(agentsToRun, canonicalContext);

    // 3. Synthesize Consensus Reconciling Domain Intelligence and Agent Perspectives
    console.log("[ORCHESTRATOR] Passing results to Consensus Service...");
    const consensusResult = await consensusService.synthesizeConsensus(canonicalContext, agentExecutionResults);
    console.log("[ORCHESTRATOR] Consensus generated");

    const responsePayload = {
      run_id: runId,
      context_id: canonicalContext.context_id,
      trigger: canonicalContext.trigger,
      duration_ms: Date.now() - startTime,
      domain_intelligence: domainAnalysis ? {
        provider: domainAnalysis.provider || provider,
        model_name: provider === 'grok' ? 'Grok AI (xAI)' : 'Gemma 2 (Local LLM)',
        model_id: provider === 'grok' ? 'grok-2-latest' : 'gemma2:2b',
        confidence_score: Math.round((domainAnalysis.confidence || 0.94) * 100),
        severity: domainAnalysis.assessment?.priority || "high",
        summary: domainAnalysis.assessment?.summary || "Operational assessment completed",
        impact: domainAnalysis.observations || [],
        recommended_actions: domainAnalysis.recommendations || [],
        dependencies: domainAnalysis.constraints || [],
        escalation_required: domainAnalysis.assessment?.priority === 'critical',
        escalation_reason: domainAnalysis.assessment?.priority === 'critical' ? 'Requires expedited manager approval' : null,
        explanation: domainAnalysis.assessment?.summary,
        status: "active_inference",
        is_fallback: Boolean(domainAnalysis.is_fallback),
      } : null,
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

    try {
      await aiPersistence.persistOrchestrationResult({ runId, payload: responsePayload });
    } catch (e) {
      console.warn("[ORCHESTRATOR] Persistence warning:", e.message);
    }

    return responsePayload;
  }
}

module.exports = new OrchestratorService();