# Security Architecture

## Authentication

### JWT-based Authentication
- Access tokens (7 day expiry)
- Refresh tokens (30 day expiry)
- Token rotation on refresh
- Secure token storage (httpOnly cookies in production)

### Password Security
- bcrypt hashing (10 rounds)
- Minimum 8 characters
- Password strength validation
- Account lockout after failed attempts

## Authorization

### Role-Based Access Control (RBAC)
- Admin role: Full system access
- User role: Own resources only

### Resource-Level Permissions
- Workspace ownership
- Repository access control
- Shared workspace members

## API Security

### Rate Limiting
- 100 requests per 15 minutes (default)
- Configurable per endpoint
- IP-based tracking
- Authenticated user tracking

### Input Validation
- Zod schema validation
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- File upload validation

### CORS Configuration
- Whitelist allowed origins
- Credentials support
- Preflight caching

### Security Headers (Helmet.js)
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Prompt Injection Defense

### Detection Patterns
```typescript
const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions?/gi,
  /disregard\s+(all\s+)?previous\s+instructions?/gi,
  /system:\s*you\s+are\s+now/gi,
];
```

### Mitigation Strategies
1. Input sanitization
2. Prompt structure enforcement
3. Output validation
4. Context isolation

## Secrets Management

### Environment Variables
- Never commit secrets to Git
- Use .env files (gitignored)
- Production secrets in secure vaults

### Secret Redaction
Automatically redact from logs:
- API keys
- Passwords
- Tokens
- Connection strings

### Patterns Detected
```typescript
const secretPatterns = [
  /sk-[a-zA-Z0-9]{48}/g,           // OpenAI keys
  /sk-ant-[a-zA-Z0-9\-]{95}/g,    // Anthropic keys
  /ghp_[a-zA-Z0-9]{36}/g,          // GitHub tokens
  /AKIA[0-9A-Z]{16}/g,             // AWS keys
];
```

## Data Protection

### Encryption at Rest
- Database encryption (PostgreSQL)
- S3 bucket encryption
- Backup encryption

### Encryption in Transit
- TLS 1.3
- HTTPS only in production
- Certificate pinning for API calls

### Data Retention
- Soft delete for user data
- GDPR compliance
- Data export capability
- Right to be forgotten

## Audit Logging

### Events Tracked
```typescript
interface AuditEvent {
  userId: string;
  action: string;        // 'login', 'create', 'update', 'delete'
  resource: string;      // 'workspace', 'repository', etc.
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```

### Log Retention
- 90 days for normal operations
- 1 year for security events
- Immutable audit trail

## Code Execution Safety

### Sandboxing
- Containerized execution
- Resource limits (CPU, memory, time)
- Network isolation
- Filesystem restrictions

### Command Validation
- Whitelist approved commands
- Argument sanitization
- Path traversal prevention
- Dangerous command blocking

### Blocked Patterns
```typescript
const dangerousCommands = [
  'rm -rf /',
  'mkfs.',
  'dd if=',
  'wget.*|.*sh',
];
```

## Dependency Security

### Package Management
- Regular dependency updates
- Vulnerability scanning (npm audit)
- License compliance checking
- Automated security alerts

### Third-party APIs
- API key rotation
- Request signing
- Timeout enforcement
- Retry limits

## Monitoring & Alerting

### Security Events
- Failed login attempts
- Rate limit violations
- Suspicious API usage
- Error spikes

### Incident Response
1. Automatic detection
2. Alert notification
3. Temporary lockdown
4. Investigation
5. Remediation
6. Post-mortem

## Compliance

### GDPR
- User consent tracking
- Data portability
- Right to erasure
- Privacy by design

### SOC 2 Type II
- Access controls
- Encryption standards
- Audit logging
- Incident response
