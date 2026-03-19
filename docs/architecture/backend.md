# Backend Architecture

## Overview

The CodePilot backend is built with a modular architecture using Express.js and TypeScript. It follows a service-oriented design with clear separation of concerns.

## Components

### API Server (`apps/api`)

The Express-based REST API server that handles:
- User authentication and authorization (JWT)
- Workspace and repository management
- Chat sessions and message handling
- Code search and retrieval
- Agent orchestration
- Patch management

### Worker Service (`apps/worker`)

Background job processor using BullMQ that handles:
- Repository indexing
- Code chunk generation
- Embedding generation
- Chat summarization
- Long-running agent tasks

## Architecture Layers

### 1. Routes Layer
- Defines API endpoints
- Request validation using Zod schemas
- Route-level middleware (auth, rate limiting)

### 2. Controller Layer
- Request/response handling
- Input validation
- Error handling
- HTTP status code management

### 3. Service Layer
- Business logic implementation
- Database operations
- External API calls
- Job queue management

### 4. Database Layer
- PostgreSQL with pgvector extension
- Connection pooling with pg
- Transaction management
- Query optimization

## Data Flow

```
Client Request
    ↓
Express Middleware (CORS, Auth, Rate Limit)
    ↓
Router
    ↓
Controller (Validation, Error Handling)
    ↓
Service (Business Logic)
    ↓
Database / External APIs / Queue
    ↓
Response
```

## Database Schema

Key tables:
- `users` - User accounts and authentication
- `workspaces` - User workspaces
- `repositories` - Code repositories
- `files` - Individual files in repositories
- `code_chunks` - Chunked code with vector embeddings
- `chat_sessions` - Chat conversations
- `chat_messages` - Individual messages
- `agent_runs` - Agent execution records
- `patches` - Code change proposals
- `audit_events` - Security audit trail
- `usage_records` - Billing and usage tracking

## Security

- JWT-based authentication
- Bcrypt password hashing
- Rate limiting per endpoint
- SQL injection prevention (parameterized queries)
- CORS configuration
- Helmet.js security headers
- Input validation with Zod

## Scalability

- Horizontal scaling of API servers
- Background job processing with workers
- Database connection pooling
- Redis caching and queue management
- Stateless API design
