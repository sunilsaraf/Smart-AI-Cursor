# ADR 0003: Electron vs Tauri

## Status
Accepted

## Context
We need to build a desktop application for CodePilot that provides a native editor experience with Monaco Editor integration and tight OS integration.

## Decision
We will use Electron for the desktop application.

## Rationale

### Requirements
1. Cross-platform (Windows, macOS, Linux)
2. Monaco Editor integration
3. File system access
4. Terminal integration
5. Native menus and dialogs
6. Auto-updates
7. Quick development iteration

### Alternatives Considered

1. **Electron** (chosen)
   - ✅ Mature ecosystem (VS Code uses it)
   - ✅ Monaco Editor proven integration
   - ✅ Large community and resources
   - ✅ Extensive plugin ecosystem
   - ✅ Well-documented
   - ❌ Larger bundle size (~150MB)
   - ❌ Higher memory usage
   - ❌ JavaScript-based security model

2. **Tauri**
   - ✅ Smaller bundle size (~15MB)
   - ✅ Lower memory usage
   - ✅ Rust backend (better security)
   - ✅ Modern architecture
   - ❌ Younger ecosystem
   - ❌ Less Monaco Editor examples
   - ❌ Smaller community
   - ❌ More complex for rapid iteration

3. **Web-only (no desktop)**
   - ✅ No distribution complexity
   - ✅ Always up-to-date
   - ❌ No file system access
   - ❌ No native integration
   - ❌ Limited offline capabilities

## Consequences

### Positive
- Faster development (familiar tech stack)
- Monaco Editor integration proven
- Large ecosystem of plugins
- Auto-update infrastructure exists
- Team has React/TypeScript expertise

### Negative
- Larger application size
- Higher memory footprint
- Need to be careful with security

### Mitigations
- Implement proper security practices
- Use context isolation
- Disable node integration in renderer
- Code signing for trust
- Monitor bundle size
- Consider Tauri for v2 if size becomes issue

## Security Considerations

### Electron Security Best Practices
```typescript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

### IPC Communication
- Use `contextBridge` for safe IPC
- Validate all IPC messages
- No direct Node.js in renderer
- Whitelist allowed operations

## Bundle Size Comparison

| Framework | Base Size | With Monaco | Total    |
|-----------|-----------|-------------|----------|
| Electron  | ~120MB    | ~30MB       | ~150MB   |
| Tauri     | ~10MB     | ~30MB       | ~40MB    |

## Migration Path

If we need to switch to Tauri later:
1. Abstract platform APIs early
2. Use adapter pattern for Electron APIs
3. Keep UI framework-agnostic
4. Test migration with subset of features
5. Gradual rollout to users

## Related Decisions
- ADR 0008: Monaco Editor integration
- ADR 0009: Desktop update strategy
- ADR 0010: Code signing approach

## References
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [VS Code Architecture](https://github.com/microsoft/vscode)
- [Tauri vs Electron](https://tauri.app/v1/references/benchmarks/)
