export class TerminalService {
  async createSession() {
    return { sessionId: 'mock-terminal-session' };
  }

  async executeCommand(command: string) {
    return { output: `Mock output for: ${command}`, exitCode: 0 };
  }
}

export const terminalService = new TerminalService();
