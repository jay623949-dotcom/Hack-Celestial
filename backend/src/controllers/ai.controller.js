const openAIService = require('../services/openai.service');

/**
 * Controller for AI Operations Analysis
 */
async function analyzeOperationalContext(req, res, next) {
  try {
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTEXT',
          message: 'Request body must include a "context" object matching agent-context.schema.json.',
        },
      });
    }

    const analysisResult = await openAIService.analyzeContext(context);

    return res.status(200).json({
      success: true,
      data: {
        analysis: analysisResult,
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
};
