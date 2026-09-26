const openAIService = require('../services/openai.service');
const contextBuilder = require('../services/context-builder.service');

/**
 * Controller for Generating Canonical AI Context from Database State
 * POST /api/v1/ai/context
 */
async function getOperationalContext(req, res, next) {
  try {
    const trigger = req.body.trigger || req.body || { type: 'multiple_incidents' };
    const context = await contextBuilder.buildContext(trigger);

    // Validate context against schema before returning
    const validation = openAIService.validateInputContext(context);
    if (!validation.valid) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONTEXT_BUILDER_VALIDATION_ERROR',
          message: 'Generated context does not adhere to canonical schema.',
          details: validation.errors,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        context,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for AI Operations Analysis
 * POST /api/v1/ai/analyze
 * Accepts either { trigger: { ... } } (builds from DB) or direct { context: { ... } }
 */
async function analyzeOperationalContext(req, res, next) {
  try {
    let context = req.body.context;

    // If trigger is provided instead of full context, build canonical context from database state
    if (!context) {
      const trigger = req.body.trigger || (req.body.type ? req.body : null);
      if (trigger) {
        context = await contextBuilder.buildContext(trigger);
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TRIGGER_OR_CONTEXT',
            message: 'Request body must include either a "trigger" object (e.g. { type: "multiple_incidents" }) or a "context" object.',
          },
        });
      }
    }

    const analysisResult = await openAIService.analyzeContext(context);

    return res.status(200).json({
      success: true,
      data: {
        analysis: analysisResult,
        context,
      },
    });
  } catch (error) {
    if (error.code === 'INVALID_CONTEXT') {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error.code === 'AI_KEY_MISSING') {
      return res.status(503).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error.code === 'AI_INVALID_RESPONSE') {
      return res.status(502).json({
        success: false,
        error: {
          code: error.code,
          message: 'AI returned an invalid analysis response.',
          details: error.message,
        },
      });
    }

    // Default API error handling
    return res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || 'AI_SERVICE_ERROR',
        message: error.message || 'An unexpected error occurred during AI analysis.',
      },
    });
  }
}

module.exports = {
  analyzeOperationalContext,
  getOperationalContext,
};
