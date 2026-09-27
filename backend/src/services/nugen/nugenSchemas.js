const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const ajv = new Ajv2020({ allErrors: true, coerceTypes: true });
addFormats(ajv);

/**
 * Strict JSON Schema for Resort 360 Nugen Domain-Aligned Output
 */
const nugenDomainResponseSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://resort360.internal/schemas/nugen/domain-response.schema.json",
  title: "NugenDomainResponse",
  description: "Structured operational output from Nugen domain-aligned hospitality intelligence model",
  type: "object",
  required: [
    "incident_id",
    "severity",
    "summary",
    "affected_departments",
    "impact",
    "recommended_actions",
    "dependencies",
    "escalation_required",
    "explanation"
  ],
  properties: {
    incident_id: {
      type: "string",
      description: "Identifier of the analyzed operational incident"
    },
    severity: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", "low", "medium", "high", "critical"],
      description: "Assessed operational severity level"
    },
    summary: {
      type: "string",
      description: "Executive synthesis of the situation and strategic decision"
    },
    affected_departments: {
      type: "array",
      items: {
        type: "string",
        enum: ["front_desk", "housekeeping", "maintenance", "revenue", "security", "food_beverage"]
      },
      description: "Departments with operational stake in this event"
    },
    impact: {
      type: "array",
      items: { type: "string" },
      description: "Specific operational risks and customer/revenue impacts"
    },
    recommended_actions: {
      type: "array",
      items: {
        type: "object",
        required: ["department", "priority", "action", "reason"],
        properties: {
          department: { type: "string" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", "low", "medium", "high", "critical"] },
          action: { type: "string" },
          reason: { type: "string" }
        }
      }
    },
    dependencies: {
      type: "array",
      items: { type: "string" },
      description: "Sequential cross-department dependencies"
    },
    escalation_required: {
      type: "boolean",
      description: "Whether manager sign-off is mandatory before execution"
    },
    escalation_reason: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description: "Justification for escalation if required"
    },
    explanation: {
      type: "object",
      required: ["what", "why", "impact"],
      properties: {
        what: { type: "string" },
        why: { type: "string" },
        impact: { type: "string" }
      }
    },
    confidence_score: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Nugen domain alignment confidence score (0-100)"
    },
    aligned_model_id: {
      type: "string",
      description: "Identifier of the Nugen aligned model used for inference"
    }
  }
};

const validateNugenOutput = ajv.compile(nugenDomainResponseSchema);

function validateNugenResponse(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be a non-null object.'] };
  }
  const valid = validateNugenOutput(data);
  if (!valid) {
    const errorMsgs = (validateNugenOutput.errors || []).map(
      (e) => `${e.instancePath || 'root'} ${e.message}`
    );
    return { valid: false, errors: errorMsgs };
  }
  return { valid: true };
}

module.exports = {
  nugenDomainResponseSchema,
  validateNugenResponse,
};
