export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  role: 'admin' | 'user';
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  defaultModel: string;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
  enableTelemetry: boolean;
}

export interface Repository {
  id: string;
  workspaceId: string;
  name: string;
  path: string;
  gitUrl?: string;
  branch?: string;
  lastIndexedAt?: Date;
  indexingStatus: 'pending' | 'indexing' | 'completed' | 'failed';
  fileCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  repositoryId: string;
  path: string;
  name: string;
  extension: string;
  language: string;
  size: number;
  content?: string;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeChunk {
  id: string;
  fileId: string;
  repositoryId: string;
  content: string;
  startLine: number;
  endLine: number;
  embedding?: number[];
  metadata: {
    language: string;
    filepath: string;
    symbols?: string[];
  };
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  model: string;
  systemPrompt?: string;
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    repositoryId?: string;
    contextFiles?: string[];
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokens?: number;
  createdAt: Date;
  metadata?: {
    codeBlocks?: CodeBlock[];
    patches?: string[];
    files?: string[];
  };
}

export interface CodeBlock {
  language: string;
  code: string;
  filepath?: string;
  startLine?: number;
  endLine?: number;
}

export interface AgentRun {
  id: string;
  workspaceId: string;
  userId: string;
  type: 'refactor' | 'debug' | 'test' | 'document' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: string;
  output?: string;
  steps: AgentStep[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface AgentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface Patch {
  id: string;
  agentRunId?: string;
  chatMessageId?: string;
  userId: string;
  repositoryId: string;
  status: 'pending' | 'applied' | 'rejected' | 'failed';
  diff: string;
  files: PatchFile[];
  createdAt: Date;
  appliedAt?: Date;
}

export interface PatchFile {
  path: string;
  action: 'create' | 'modify' | 'delete';
  originalContent?: string;
  newContent?: string;
  hunks: PatchHunk[];
}

export interface PatchHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface AuditEvent {
  id: string;
  userId: string;
  workspaceId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  workspaceId: string;
  model: string;
  operation: 'chat' | 'completion' | 'embedding' | 'rerank';
  inputTokens: number;
  outputTokens: number;
  cost: number;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface WebSocketMessage {
  type: 'chat' | 'agent' | 'indexing' | 'patch' | 'error';
  payload: any;
  timestamp: Date;
}
