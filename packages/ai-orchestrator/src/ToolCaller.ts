export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

export interface ToolCallResult {
  toolName: string;
  arguments: any;
  result: any;
  error?: string;
}

export class ToolCaller {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  unregisterTool(name: string): void {
    this.tools.delete(name);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsForOpenAI(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  }> {
    return this.getAllTools().map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async executeTool(name: string, args: any): Promise<ToolCallResult> {
    const tool = this.tools.get(name);
    
    if (!tool) {
      return {
        toolName: name,
        arguments: args,
        result: null,
        error: `Tool '${name}' not found`,
      };
    }

    try {
      const result = await tool.handler(args);
      return {
        toolName: name,
        arguments: args,
        result,
      };
    } catch (error) {
      return {
        toolName: name,
        arguments: args,
        result: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async executeMultipleTools(
    calls: Array<{ name: string; args: any }>
  ): Promise<ToolCallResult[]> {
    return Promise.all(calls.map(call => this.executeTool(call.name, call.args)));
  }

  registerDefaultTools(): void {
    this.registerTool({
      name: 'read_file',
      description: 'Read the contents of a file',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The file path to read',
          },
        },
        required: ['path'],
      },
      handler: async (args) => {
        return { content: `Mock content of ${args.path}` };
      },
    });

    this.registerTool({
      name: 'write_file',
      description: 'Write content to a file',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The file path to write to',
          },
          content: {
            type: 'string',
            description: 'The content to write',
          },
        },
        required: ['path', 'content'],
      },
      handler: async (args) => {
        return { success: true, path: args.path };
      },
    });

    this.registerTool({
      name: 'search_code',
      description: 'Search for code in the codebase',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query',
          },
          language: {
            type: 'string',
            description: 'Optional language filter',
          },
        },
        required: ['query'],
      },
      handler: async (args) => {
        return { results: [] };
      },
    });

    this.registerTool({
      name: 'execute_command',
      description: 'Execute a shell command',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The command to execute',
          },
        },
        required: ['command'],
      },
      handler: async (args) => {
        return { output: 'Command execution not implemented', exitCode: 0 };
      },
    });

    this.registerTool({
      name: 'list_files',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The directory path',
          },
          pattern: {
            type: 'string',
            description: 'Optional glob pattern to filter files',
          },
        },
        required: ['path'],
      },
      handler: async (args) => {
        return { files: [] };
      },
    });
  }
}
