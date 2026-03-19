export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
  WORKSPACES: {
    BASE: '/api/workspaces',
    BY_ID: (id: string) => `/api/workspaces/${id}`,
    MEMBERS: (id: string) => `/api/workspaces/${id}/members`,
  },
  REPOSITORIES: {
    BASE: '/api/repositories',
    BY_ID: (id: string) => `/api/repositories/${id}`,
    INDEX: (id: string) => `/api/repositories/${id}/index`,
    FILES: (id: string) => `/api/repositories/${id}/files`,
  },
  CHAT: {
    SESSIONS: '/api/chat/sessions',
    SESSION_BY_ID: (id: string) => `/api/chat/sessions/${id}`,
    MESSAGES: (sessionId: string) => `/api/chat/sessions/${sessionId}/messages`,
    MESSAGE_BY_ID: (sessionId: string, messageId: string) =>
      `/api/chat/sessions/${sessionId}/messages/${messageId}`,
  },
  SEARCH: {
    CODE: '/api/search/code',
    SEMANTIC: '/api/search/semantic',
    FILES: '/api/search/files',
  },
  AGENTS: {
    BASE: '/api/agents',
    RUN: '/api/agents/run',
    BY_ID: (id: string) => `/api/agents/${id}`,
    CANCEL: (id: string) => `/api/agents/${id}/cancel`,
  },
  PATCHES: {
    BASE: '/api/patches',
    BY_ID: (id: string) => `/api/patches/${id}`,
    APPLY: (id: string) => `/api/patches/${id}/apply`,
    REJECT: (id: string) => `/api/patches/${id}/reject`,
  },
  INDEXING: {
    STATUS: (repositoryId: string) => `/api/indexing/${repositoryId}/status`,
    TRIGGER: '/api/indexing/trigger',
  },
  TERMINAL: {
    SESSIONS: '/api/terminal/sessions',
    EXECUTE: '/api/terminal/execute',
  },
} as const;

export const MODEL_NAMES = {
  CHAT: {
    GPT4_TURBO: 'gpt-4-turbo-preview',
    GPT4: 'gpt-4',
    GPT35_TURBO: 'gpt-3.5-turbo',
    CLAUDE_OPUS: 'claude-3-opus-20240229',
    CLAUDE_SONNET: 'claude-3-sonnet-20240229',
    CLAUDE_HAIKU: 'claude-3-haiku-20240307',
  },
  EMBEDDING: {
    OPENAI_SMALL: 'text-embedding-3-small',
    OPENAI_LARGE: 'text-embedding-3-large',
    OPENAI_ADA: 'text-embedding-ada-002',
  },
  RERANK: {
    COHERE: 'rerank-english-v2.0',
  },
} as const;

export const LIMITS = {
  MAX_CHUNK_SIZE: 2048,
  MIN_CHUNK_SIZE: 128,
  DEFAULT_CHUNK_SIZE: 512,
  CHUNK_OVERLAP: 50,
  MAX_CONTEXT_CHUNKS: 20,
  MAX_MESSAGE_LENGTH: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_REPO: 50000,
  DEFAULT_TOP_K: 10,
  MAX_TOP_K: 100,
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  SESSION_EXPIRY_DAYS: 7,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
} as const;

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'csharp',
  'sql',
  'html',
  'css',
  'scss',
  'json',
  'yaml',
  'markdown',
  'shell',
] as const;

export const FILE_EXTENSIONS_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.cs': 'csharp',
  '.sql': 'sql',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sh': 'shell',
  '.bash': 'shell',
};

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  CHAT_MESSAGE: 'chat:message',
  CHAT_STREAM: 'chat:stream',
  CHAT_ERROR: 'chat:error',
  AGENT_UPDATE: 'agent:update',
  AGENT_COMPLETE: 'agent:complete',
  INDEXING_PROGRESS: 'indexing:progress',
  INDEXING_COMPLETE: 'indexing:complete',
  PATCH_APPLIED: 'patch:applied',
  ERROR: 'error',
} as const;
