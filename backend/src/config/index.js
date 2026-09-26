const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini', // 'gemini' | 'openai' | 'local'
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    },
    local: {
      baseURL: process.env.LOCAL_AI_BASE_URL || 'http://localhost:11434/v1',
      model: process.env.LOCAL_AI_MODEL || 'llama3.2',
    },
  },
  // Backward compatibility alias for openai
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};
