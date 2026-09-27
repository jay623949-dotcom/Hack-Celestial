const nugenAlignmentService = require('./nugenAlignmentService');
const nugenInferenceService = require('./nugenInferenceService');
const nugenSchemas = require('./nugenSchemas');

/**
 * NugenService
 * Central entry point for Nugen Intelligence integration into Resort 360.
 */
class NugenService {
  constructor() {
    this.alignment = nugenAlignmentService;
    this.inference = nugenInferenceService;
    this.schemas = nugenSchemas;
  }

  /**
   * Health and connectivity check for Nugen Service
   */
  async getStatus() {
    const apiKey = this.inference.getApiKey();
    const modelId = this.inference.getModelId();
    const baseUrl = this.inference.baseUrl;

    const statusObj = {
      provider: 'nugen',
      configured: Boolean(apiKey),
      base_url: baseUrl,
      model_id: modelId,
      alignment_ready: true,
      mode: apiKey ? 'live_cloud' : 'local_domain_simulation',
    };

    if (apiKey) {
      try {
        const baseModels = await this.alignment.listBaseModels({ limit: 1 });
        statusObj.connection = 'connected';
        statusObj.models_available = baseModels?.models?.length || 0;
      } catch (err) {
        statusObj.connection = 'unreachable';
        statusObj.error = err.message;
      }
    } else {
      statusObj.connection = 'ready_offline_resilient';
    }

    return statusObj;
  }

  /**
   * Execute domain analysis on canonical operational context
   */
  async analyzeOperationalIncident(canonicalContext) {
    return this.inference.analyzeResortIncident(canonicalContext);
  }
}

module.exports = new NugenService();
