import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://codepilot:codepilot@localhost:5432/codepilot',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  
  jwt: {
    secret: (() => {
      const secret = process.env.JWT_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
      }
      return secret || 'dev-secret-key-do-not-use-in-production';
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    orgId: process.env.OPENAI_ORG_ID,
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  
  cohere: {
    apiKey: process.env.COHERE_API_KEY,
  },
  
  vector: {
    dimensions: parseInt(process.env.VECTOR_DIMENSIONS || '1536', 10),
  },
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'codepilot',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE || '100', 10),
  },
  
  chunk: {
    size: parseInt(process.env.CHUNK_SIZE || '512', 10),
    overlap: parseInt(process.env.CHUNK_OVERLAP || '50', 10),
  },
  
  chat: {
    defaultModel: process.env.CHAT_MODEL_DEFAULT || 'gpt-4-turbo-preview',
    fastModel: process.env.CHAT_MODEL_FAST || 'gpt-3.5-turbo',
    reasoningModel: process.env.CHAT_MODEL_REASONING || 'claude-3-opus-20240229',
  },
  
  code: {
    editModel: process.env.CODE_MODEL_EDIT || 'gpt-4-turbo-preview',
    reviewModel: process.env.CODE_MODEL_REVIEW || 'gpt-4-turbo-preview',
  },
  
  features: {
    agentsEnabled: process.env.FEATURE_AGENTS_ENABLED === 'true',
    terminalEnabled: process.env.FEATURE_TERMINAL_ENABLED === 'true',
    voiceEnabled: process.env.FEATURE_VOICE_ENABLED === 'true',
  },
  
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3001',
  
  logLevel: process.env.LOG_LEVEL || 'info',
};
