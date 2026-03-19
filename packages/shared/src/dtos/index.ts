import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const CreateWorkspaceRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type CreateWorkspaceRequest = z.infer<typeof CreateWorkspaceRequestSchema>;

export const CreateRepositoryRequestSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1),
  path: z.string(),
  gitUrl: z.string().url().optional(),
  branch: z.string().optional(),
});

export type CreateRepositoryRequest = z.infer<typeof CreateRepositoryRequestSchema>;

export const CreateChatSessionRequestSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().optional(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  repositoryId: z.string().uuid().optional(),
});

export type CreateChatSessionRequest = z.infer<typeof CreateChatSessionRequestSchema>;

export const SendChatMessageRequestSchema = z.object({
  content: z.string().min(1).max(10000),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  stream: z.boolean().optional(),
});

export type SendChatMessageRequest = z.infer<typeof SendChatMessageRequestSchema>;

export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: any;
}

export const SearchCodeRequestSchema = z.object({
  query: z.string().min(1),
  repositoryId: z.string().uuid().optional(),
  workspaceId: z.string().uuid(),
  language: z.string().optional(),
  topK: z.number().positive().max(100).optional(),
  useSemanticSearch: z.boolean().optional(),
});

export type SearchCodeRequest = z.infer<typeof SearchCodeRequestSchema>;

export interface SearchCodeResponse {
  results: Array<{
    fileId: string;
    filepath: string;
    content: string;
    score: number;
    startLine: number;
    endLine: number;
    language: string;
  }>;
  totalResults: number;
}

export const RunAgentRequestSchema = z.object({
  workspaceId: z.string().uuid(),
  repositoryId: z.string().uuid().optional(),
  type: z.enum(['refactor', 'debug', 'test', 'document', 'custom']),
  input: z.string().min(1),
  files: z.array(z.string()).optional(),
});

export type RunAgentRequest = z.infer<typeof RunAgentRequestSchema>;

export interface AgentRunResponse {
  id: string;
  status: string;
  message: string;
}

export const ApplyPatchRequestSchema = z.object({
  diff: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      action: z.enum(['create', 'modify', 'delete']),
      content: z.string().optional(),
    })
  ),
});

export type ApplyPatchRequest = z.infer<typeof ApplyPatchRequestSchema>;

export interface PatchResponse {
  id: string;
  status: string;
  appliedFiles: string[];
  errors?: string[];
}

export const IndexRepositoryRequestSchema = z.object({
  repositoryId: z.string().uuid(),
  force: z.boolean().optional(),
});

export type IndexRepositoryRequest = z.infer<typeof IndexRepositoryRequestSchema>;

export interface IndexingStatusResponse {
  repositoryId: string;
  status: 'pending' | 'indexing' | 'completed' | 'failed';
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  chunksGenerated: number;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
