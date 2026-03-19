# ADR 0001: Monorepo Choice

## Status
Accepted

## Context
We need to decide on a repository structure for the CodePilot project, which consists of multiple applications (API, worker, web, desktop) and shared packages.

## Decision
We will use a monorepo structure managed with pnpm workspaces.

## Rationale

### Advantages
1. **Shared Code**: Easy to share types, utilities, and components across applications
2. **Atomic Changes**: Single PR can update multiple packages consistently
3. **Simplified Dependencies**: Internal packages use `workspace:*` protocol
4. **Unified Tooling**: Single TypeScript config, linting, testing setup
5. **Better Developer Experience**: Single clone, single install, see all code

### Alternatives Considered
1. **Polyrepo**: Separate repos for each app/package
   - ❌ Harder to coordinate changes across packages
   - ❌ More complex CI/CD setup
   - ❌ Dependency version management overhead

2. **Lerna**: Older monorepo tool
   - ❌ Less actively maintained
   - ❌ More complex than pnpm workspaces
   - ✅ More features (versioning, publishing)

3. **Turborepo**: Modern monorepo tool
   - ✅ Great caching and task orchestration
   - ❌ Additional complexity for our needs
   - ⚠️ May adopt in future if needed

## Consequences

### Positive
- Faster development with shared code
- Easier refactoring across packages
- Consistent tooling and versions
- Single source of truth

### Negative
- Larger repository size
- Potentially slower git operations
- Need to manage workspace dependencies carefully
- All developers need access to all code

### Mitigations
- Use `.gitignore` for build artifacts
- Implement proper CI caching
- Clear workspace dependency boundaries
- Use pnpm's filtering for targeted operations

## Implementation
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Related Decisions
- ADR 0002: Package manager choice (pnpm)
- ADR 0004: Shared TypeScript configuration
