import type { CodeChunk } from '@codepilot/shared';

export interface PromptContext {
  codeChunks?: CodeChunk[];
  currentFile?: {
    path: string;
    content: string;
    language: string;
  };
  selection?: {
    content: string;
    startLine: number;
    endLine: number;
  };
  diagnostics?: Array<{
    message: string;
    severity: string;
    line: number;
  }>;
  recentFiles?: string[];
  userQuery: string;
}

export interface BuildPromptOptions {
  includeSystemPrompt?: boolean;
  maxContextLength?: number;
  prioritizeRecent?: boolean;
  includeLineNumbers?: boolean;
}

export class PromptBuilder {
  private maxTokens: number;

  constructor(maxTokens = 8000) {
    this.maxTokens = maxTokens;
  }

  buildChatPrompt(
    context: PromptContext,
    options: BuildPromptOptions = {}
  ): Array<{ role: string; content: string }> {
    const {
      includeSystemPrompt = true,
      maxContextLength = 4000,
      includeLineNumbers = true,
    } = options;

    const messages: Array<{ role: string; content: string }> = [];

    if (includeSystemPrompt) {
      messages.push({
        role: 'system',
        content: this.buildSystemPrompt(context),
      });
    }

    const contextContent = this.buildContextContent(context, {
      maxLength: maxContextLength,
      includeLineNumbers,
    });

    if (contextContent) {
      messages.push({
        role: 'user',
        content: contextContent,
      });
    }

    messages.push({
      role: 'user',
      content: context.userQuery,
    });

    return messages;
  }

  buildEditPrompt(
    code: string,
    instruction: string,
    language?: string
  ): Array<{ role: string; content: string }> {
    return [
      {
        role: 'system',
        content: `You are an expert ${language || 'code'} editor. Your task is to modify code according to instructions.
Rules:
- Only output the modified code, no explanations
- Preserve the code structure and style
- Make minimal changes necessary to fulfill the instruction
- Maintain correct syntax and formatting`,
      },
      {
        role: 'user',
        content: `Instruction: ${instruction}\n\nCode to edit:\n\`\`\`${language || ''}\n${code}\n\`\`\``,
      },
    ];
  }

  buildExplainPrompt(
    code: string,
    language?: string
  ): Array<{ role: string; content: string }> {
    return [
      {
        role: 'system',
        content: 'You are an expert programmer who explains code clearly and concisely.',
      },
      {
        role: 'user',
        content: `Explain this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``,
      },
    ];
  }

  buildDebugPrompt(
    code: string,
    error: string,
    language?: string
  ): Array<{ role: string; content: string }> {
    return [
      {
        role: 'system',
        content: 'You are an expert debugger. Identify the issue and suggest a fix.',
      },
      {
        role: 'user',
        content: `Code:\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\nError:\n${error}\n\nWhat's the issue and how to fix it?`,
      },
    ];
  }

  buildTestGenerationPrompt(
    code: string,
    language?: string
  ): Array<{ role: string; content: string }> {
    return [
      {
        role: 'system',
        content: `You are an expert test writer. Generate comprehensive unit tests for the given code.`,
      },
      {
        role: 'user',
        content: `Generate tests for this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``,
      },
    ];
  }

  buildDocumentationPrompt(
    code: string,
    language?: string
  ): Array<{ role: string; content: string }> {
    return [
      {
        role: 'system',
        content: 'You are a technical writer. Generate clear and comprehensive documentation.',
      },
      {
        role: 'user',
        content: `Generate documentation for this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``,
      },
    ];
  }

  private buildSystemPrompt(context: PromptContext): string {
    let prompt = `You are CodePilot, an AI coding assistant. You help developers write, understand, and improve code.

Capabilities:
- Answer questions about code and codebases
- Suggest code improvements and refactorings
- Debug issues and explain errors
- Generate code based on requirements
- Review code for best practices and potential issues

Guidelines:
- Be concise and precise in your responses
- Provide working code when asked
- Explain your reasoning when helpful
- Use markdown for code formatting
- Reference specific files and line numbers when available`;

    if (context.currentFile) {
      prompt += `\n\nCurrent context: You are working in ${context.currentFile.path} (${context.currentFile.language})`;
    }

    return prompt;
  }

  private buildContextContent(
    context: PromptContext,
    options: { maxLength: number; includeLineNumbers: boolean }
  ): string {
    const parts: string[] = [];

    if (context.currentFile) {
      let fileContent = `Current file: ${context.currentFile.path}\n\`\`\`${context.currentFile.language}\n`;
      
      if (options.includeLineNumbers) {
        const lines = context.currentFile.content.split('\n');
        fileContent += lines.map((line, idx) => `${idx + 1}: ${line}`).join('\n');
      } else {
        fileContent += context.currentFile.content;
      }
      
      fileContent += '\n```';
      parts.push(fileContent);
    }

    if (context.selection) {
      parts.push(
        `Selected code (lines ${context.selection.startLine}-${context.selection.endLine}):\n\`\`\`\n${context.selection.content}\n\`\`\``
      );
    }

    if (context.codeChunks && context.codeChunks.length > 0) {
      parts.push('Relevant code from codebase:');
      context.codeChunks.slice(0, 5).forEach((chunk, idx) => {
        parts.push(
          `\n[${idx + 1}] ${chunk.metadata.filepath}:${chunk.startLine}-${chunk.endLine}\n\`\`\`${chunk.metadata.language}\n${chunk.content}\n\`\`\``
        );
      });
    }

    if (context.diagnostics && context.diagnostics.length > 0) {
      parts.push('\nDiagnostics:');
      context.diagnostics.forEach(d => {
        parts.push(`- Line ${d.line}: [${d.severity}] ${d.message}`);
      });
    }

    let content = parts.join('\n\n');
    
    if (content.length > options.maxLength) {
      content = content.substring(0, options.maxLength) + '\n... (context truncated)';
    }

    return content;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  truncateToTokenLimit(text: string, maxTokens: number): string {
    const estimatedChars = maxTokens * 4;
    if (text.length <= estimatedChars) {
      return text;
    }
    return text.substring(0, estimatedChars) + '...';
  }
}
