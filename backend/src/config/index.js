const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');

module.exports = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: frontendUrl,
  frontendUrl: frontendUrl,
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: process.env.DATABASE_SSL,
  jwtSecret: process.env.JWT_SECRET || 'resort360-jwt-secret-demo-key',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'grok').toLowerCase(), // 'grok' (Primary xAI) | 'gemma2' (Local/Ollama)
    grok: {
      apiKey: process.env.XAI_API_KEY || process.env.GROK_API_KEY || '',
      baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
      model: process.env.GROK_MODEL || 'grok-2-latest',
    },
    gemma: {
      baseURL: process.env.GEMMA_BASE_URL || process.env.LOCAL_AI_BASE_URL || 'http://localhost:11434/v1',
      model: process.env.GEMMA_MODEL || process.env.LOCAL_AI_MODEL || 'gemma2:2b',
      apiKey: process.env.GEMMA_API_KEY || 'local',
    },
    local: {
      baseURL: process.env.LOCAL_AI_BASE_URL || 'http://localhost:11434/v1',
      model: process.env.LOCAL_AI_MODEL || 'gemma2:2b',
    },
  },
  // Backward compatibility alias for openai
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};
