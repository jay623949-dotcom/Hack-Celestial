/**
 * Centralized error handling middleware.
 * Ensures zero sensitive information or stack traces leak in production.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code;

  // Handle malformed JSON request bodies
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON_PAYLOAD';
    message = 'Invalid JSON payload received in request body.';
  }

  // Handle database connection failures safely without leaking credentials
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === '57P01') {
    statusCode = 503;
    errorCode = 'DATABASE_UNAVAILABLE';
    message = 'Database service is temporarily unavailable. Operational cache active.';
  }

  // Derive canonical error code if not explicitly provided
  if (!errorCode) {
    if (statusCode === 404) errorCode = 'RESOURCE_NOT_FOUND';
    else if (statusCode === 400) errorCode = 'VALIDATION_ERROR';
    else if (statusCode === 401) errorCode = 'UNAUTHENTICATED';
    else if (statusCode === 403) errorCode = 'UNAUTHORIZED';
    else if (statusCode === 409) errorCode = 'STATE_CONFLICT';
    else if (statusCode === 422) errorCode = 'UNPROCESSABLE_ENTITY';
    else if (statusCode === 429) errorCode = 'RATE_LIMIT_EXCEEDED';
    else if (statusCode === 502) errorCode = 'UPSTREAM_SERVICE_ERROR';
    else if (statusCode === 503) errorCode = 'SERVICE_UNAVAILABLE';
    else if (statusCode === 504) errorCode = 'GATEWAY_TIMEOUT';
    else errorCode = 'INTERNAL_SERVER_ERROR';
  }

  // Server-side logging with [SERVER] prefix
  console.error(`[SERVER] Error: ${req.method} ${req.originalUrl} - ${statusCode} [${errorCode}]: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error(err.stack);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage = isProduction && statusCode >= 500
    ? 'Unable to process request'
    : message;

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    error: {
      code: errorCode,
      message: clientMessage,
      ...(!isProduction && err.details ? { details: err.details } : {}),
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * 404 Route Not Found middleware.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
