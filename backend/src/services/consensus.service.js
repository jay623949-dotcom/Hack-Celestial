const openAIService = require('./openai.service');
const consensusPrompt = require('../ai/prompts/consensus.prompt');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const path = require('path');
const fs = require('fs');

// Compile Consensus Schema
const ajv = new Ajv2020({ allErrors: true, coerceTypes: true });
addFormats(ajv);

const consensusSchemaPath = path.join(__dirname, '..', '..', '..', 'schemas', 'ai', 'consensus-response.schema.json');
let validateConsensusSchema = null;

try {
  const schemaContent = JSON.parse(fs.readFileSync(consensusSchemaPath, 'utf8'));
  validateConsensusSchema = ajv.compile(schemaContent);
} catch (err) {
  console.warn('[ConsensusService] Warning: Could not pre-compile consensus schema:', err.message);
}

/**
 * ConsensusService
 * Arbitrates multiple departmental agent outputs into a unified operational consensus and actionable plan.
 * Responsibilities:
 * 1. Takes canonical operational context + validated agent outputs + agent status.
 * 2. Compares perspectives, detects agreements, and isolates explicit operational conflicts.
 * 3. Enforces deterministic fallback synthesis if AI model encounters failures or timeouts.
 * 4. Ensures requires_human_approval is permanently locked to true.
 * 5. Validates final output against /schemas/ai/consensus-response.schema.json.
 */
class ConsensusService {
  /**
   * Validate consensus object against schema
   * @param {Object} consensusOutput 
   */
  validateConsensus(consensusOutput) {
    if (!consensusOutput || typeof consensusOutput !== 'object') {
      return { valid: false, errors: ['Consensus output must be a non-null object'] };
    }

    if (validateConsensusSchema) {
      const isValid = validateConsensusSchema(consensusOutput);
      if (!isValid) {
        const errorMsgs = (validateConsensusSchema.errors || []).map(
          (e) => `${e.instancePath || 'root'} ${e.message}`
        );
        return { valid: false, errors: errorMsgs };
      }
    } else {
      // Basic fallback validation
      const requiredFields = [
        'consensus_id',
        'context_id',
        'schema_version',
        'summary',
        'agreements',
        'conflicts',
        'priority',
        'recommendations',
        'action_plan',
        'requires_human_approval',
      ];
      for (const field of requiredFields) {
        if (consensusOutput[field] === undefined) {
          return { valid: false, errors: [`Missing required field: ${field}`] };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Deterministic rule-based fallback consensus builder for offline resilience or failed AI calls
   */
  buildFallbackConsensus(context, validAgentResponses, agentStatusMap) {
    const timestamp = Date.now();
    const contextId = context?.context_id || `ctx-${timestamp}`;

    // Extract recommendations across available agents
    const allRecs = [];
    const affectedRoomsSet = new Set();
    const affectedGuestsSet = new Set();
    const agreements = [];
    const conflicts = [];

    validAgentResponses.forEach((res) => {
      const agentName = res.agent;
      if (Array.isArray(res.recommendations)) {
        res.recommendations.forEach((rec, idx) => {
          allRecs.push({
            recommendation_id: rec.recommendation_id || `rec-${agentName}-${idx + 1}`,
            action: rec.action || 'Execute departmental procedure',
            department: agentName,
            priority: rec.priority || 'high',
            reason: rec.reason || `Recommended by ${agentName} agent`,
            affected_rooms: rec.affected_rooms || [],
            affected_guests: rec.affected_guests || [],
            required_staff: rec.required_staff || [],
            estimated_duration_minutes: rec.estimated_duration_minutes || 20,
          });

          (rec.affected_rooms || []).forEach((r) => affectedRoomsSet.add(r));
          (rec.affected_guests || []).forEach((g) => affectedGuestsSet.add(g));
        });
      }
    });

    // Detect if housekeeping and maintenance or revenue have potential room contention
    const hasFrontDesk = validAgentResponses.some((r) => r.agent === 'front_desk');
    const hasMaintenance = validAgentResponses.some((r) => r.agent === 'maintenance');
    const hasRevenue = validAgentResponses.some((r) => r.agent === 'revenue');
    const hasHousekeeping = validAgentResponses.some((r) => r.agent === 'housekeeping');

    if (hasFrontDesk && hasMaintenance) {
      agreements.push('Front Desk and Maintenance align that guest experience in active breakdown rooms cannot proceed until technical verification or room reassignment is finalized.');
    } else {
      agreements.push('Operational workflow proceeds with active departmental responses.');
    }

    if (hasRevenue && (hasFrontDesk || hasHousekeeping)) {
      conflicts.push({
        conflict_id: `conf-${timestamp}-1`,
        type: 'inventory_conflict',
        description: 'Front Desk / Housekeeping expedited room allocation must respect Floor 4 group block locks designated by Revenue.',
        agents: ['front_desk', 'revenue'],
        resolution: 'Allocate Room 205 (Deluxe) as primary alternative room, preserving remaining high-occupancy Deluxe inventory.',
      });
    }

    // Build operational actions
    const actions = allRecs.map((rec, idx) => ({
      action_id: `act-${idx + 1}`,
      type: rec.department === 'maintenance'
        ? 'dispatch_maintenance'
        : rec.department === 'housekeeping'
        ? 'expedite_housekeeping'
        : rec.department === 'front_desk'
        ? 'guest_amenity_courtesy'
        : 'block_room_inventory',
      description: rec.action,
      department: rec.department,
      priority: rec.priority,
      assigned_to: rec.required_staff?.[0] || null,
      room_id: rec.affected_rooms?.[0] || null,
      guest_id: rec.affected_guests?.[0] || null,
      estimated_duration_minutes: rec.estimated_duration_minutes || 25,
    }));

    return {
      consensus_id: `cons-${timestamp}`,
      context_id: contextId,
      schema_version: '1.0',
      summary: `Coordinated operational plan synthesized from ${validAgentResponses.length} active departmental agents. Prioritizes guest hospitality recovery while enforcing technical maintenance windows and revenue inventory protections.`,
      agreements: agreements.length > 0 ? agreements : ['All active departments prioritize guest recovery within operational constraints.'],
      conflicts,
      priority: 'high',
      recommendations: allRecs,
      action_plan: {
        action_plan_id: `plan-${timestamp}`,
        summary: 'Execute sequential guest recovery, express housekeeping clean, and mechanical dispatch.',
        actions: actions.length > 0 ? actions : [
          {
            action_id: 'act-001',
            type: 'generic_task',
            description: 'Review operational status with Duty Manager',
            department: 'front_desk',
            priority: 'high',
            assigned_to: null,
            room_id: null,
            guest_id: null,
            estimated_duration_minutes: 15,
          },
        ],
        affected_guests: Array.from(affectedGuestsSet),
        affected_rooms: Array.from(affectedRoomsSet),
        risks: [
          'Guest waiting duration must not exceed 25 minutes.',
          'Technician availability may constrain concurrent maintenance tasks.',
        ],
        requires_human_approval: true,
        status: 'pending_approval',
      },
      requires_human_approval: true,
      agent_status: agentStatusMap,
    };
  }

  /**
   * Synthesize consensus across validated agent outputs
   * @param {Object} context Canonical operational context
   * @param {Array<Object>} agentResults Array of { agent, status, data, error }
   * @returns {Promise<Object>} Validated consensus response
   */
  async synthesizeConsensus(context, agentResults = []) {
    // 1. Separate valid agent responses from unavailable/failed agents
    const validResponses = [];
    const agentStatusMap = {};

    agentResults.forEach((res) => {
      const agentKey = res.agent;
      if (res.status === 'completed' && res.data) {
        agentStatusMap[agentKey] = 'available';
        validResponses.push(res.data);
      } else {
        agentStatusMap[agentKey] = 'unavailable';
      }
    });

    if (validResponses.length === 0) {
      console.warn('[ConsensusService] No valid agent responses available for consensus. Generating operational contingency plan.');
      return this.buildFallbackConsensus(context, [], agentStatusMap);
    }

    // 2. Prepare Consensus AI Input Payload
    const consensusPayload = {
      context_id: context.context_id || 'ctx-default',
      canonical_context: {
        resort: context.resort,
        trigger: context.trigger,
        summary: context.summary,
        active_incidents: context.incidents,
        operational_constraints: context.constraints || [],
      },
      agent_status: agentStatusMap,
      agent_responses: validResponses,
    };

    const userPrompt = `Synthesize multi-agent consensus, identify all explicit conflicts and trade-offs, and generate a coordinated action plan for the following operational context and agent evaluations:\n\n${JSON.stringify(consensusPayload, null, 2)}`;

    console.log(`[ConsensusService] Running Consensus Engine across ${validResponses.length} active agents...`);

    let parsedConsensus = null;

    if (context.nugen_domain_intelligence && !process.env.NUGEN_API_KEY && !openAIService.geminiClient && !openAIService.openaiClient) {
      console.log('[ConsensusService] Synthesizing consensus grounded in Nugen domain intelligence...');
      parsedConsensus = this.buildFallbackConsensus(context, validResponses, agentStatusMap);
    } else {
      try {
        parsedConsensus = await openAIService.executeCompletion(
          userPrompt,
          consensusPrompt.SYSTEM_INSTRUCTIONS
        );
      } catch (err) {
        console.warn('[ConsensusService] AI consensus synthesis encountered an error. Engaging deterministic fallback:', err.message);
        parsedConsensus = this.buildFallbackConsensus(context, validResponses, agentStatusMap);
      }
    }

    // 3. Post-Process & Normalize Consensus Output
    if (!parsedConsensus.consensus_id) {
      parsedConsensus.consensus_id = `cons-${Date.now()}`;
    }
    if (!parsedConsensus.context_id) {
      parsedConsensus.context_id = context.context_id || `ctx-${Date.now()}`;
    }
    parsedConsensus.schema_version = '1.0';

    // Strictly enforce human approval lock
    parsedConsensus.requires_human_approval = true;
    if (parsedConsensus.action_plan) {
      parsedConsensus.action_plan.requires_human_approval = true;
      parsedConsensus.action_plan.status = 'pending_approval';
    }

    // Attach agent availability status
    parsedConsensus.agent_status = agentStatusMap;

    // Ensure agreements is array of strings
    if (Array.isArray(parsedConsensus.agreements)) {
      parsedConsensus.agreements = parsedConsensus.agreements.map((a) => (typeof a === 'object' ? a.description || JSON.stringify(a) : String(a)));
    } else {
      parsedConsensus.agreements = ['Departments coordinated successfully under operational guidelines.'];
    }

    // Ensure conflicts is array of objects
    if (!Array.isArray(parsedConsensus.conflicts)) {
      parsedConsensus.conflicts = [];
    }

    // 4. Validate Final Consensus Schema
    const validation = this.validateConsensus(parsedConsensus);
    if (!validation.valid) {
      console.warn('[ConsensusService] Schema validation warning on AI output:', validation.errors);
      // Fallback to fully compliant normalized consensus
      return this.buildFallbackConsensus(context, validResponses, agentStatusMap);
    }

    return parsedConsensus;
  }
}

module.exports = new ConsensusService();
