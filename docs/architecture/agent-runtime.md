# Agent Runtime Architecture

## Overview

The agent runtime provides autonomous AI agents that can perform complex, multi-step coding tasks like refactoring, debugging, testing, and documentation.

## Agent Types

1. **Refactor Agent** - Code restructuring and optimization
2. **Debug Agent** - Error diagnosis and fixing
3. **Test Agent** - Unit test generation
4. **Document Agent** - Documentation generation
5. **Custom Agent** - User-defined workflows

## Agent Execution Flow

```
Agent Request
    ↓
Create Agent Run (status: pending)
    ↓
Queue Job (BullMQ)
    ↓
Worker Picks Up Job
    ↓
Execute Agent Steps
    ├─ Step 1: Analyze code
    ├─ Step 2: Generate plan
    ├─ Step 3: Execute changes
    └─ Step 4: Validate results
    ↓
Update Run Status (completed/failed)
    ↓
Store Output & Patches
    ↓
Notify Client (WebSocket)
```

## Agent Structure

```typescript
interface AgentRun {
  id: string;
  type: 'refactor' | 'debug' | 'test' | 'document';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: string;
  output?: string;
  steps: AgentStep[];
  createdAt: Date;
  completedAt?: Date;
}

interface AgentStep {
  id: string;
  name: string;
  status: string;
  input?: any;
  output?: any;
  startedAt?: Date;
  completedAt?: Date;
}
```

## Tool Calling

Agents can call tools to interact with the codebase:

```typescript
const tools = [
  'read_file',      // Read file contents
  'write_file',     // Write file contents
  'search_code',    // Search codebase
  'execute_command', // Run terminal commands
  'list_files',     // List directory contents
];
```

Tool calls are validated and sandboxed for security.

## Safety Mechanisms

1. **Input Validation**
   - Prompt injection detection
   - Command validation
   - File path sanitization

2. **Output Filtering**
   - Secret redaction
   - Malicious code detection
   - Size limits

3. **Resource Limits**
   - Execution timeout
   - Memory limits
   - Rate limiting

4. **Approval Workflow**
   - User must approve patches
   - Rollback capability
   - Change preview

## Prompt Engineering

Agents use structured prompts:

```
System: You are an expert refactoring agent...

Context:
- Current file: src/utils.ts
- Language: TypeScript
- Request: Extract function to separate file

Constraints:
- Preserve functionality
- Maintain code style
- Update imports
- Generate tests

Task: [User's request]
```

## State Management

Agent state is stored in:
- `agent_runs` table - Run metadata
- `agent_steps` JSONB field - Step history
- `patches` table - Generated changes
- Redis - Temporary state during execution

## Monitoring

Track agent performance:
- Success/failure rates
- Execution time per step
- Token usage
- User satisfaction ratings
