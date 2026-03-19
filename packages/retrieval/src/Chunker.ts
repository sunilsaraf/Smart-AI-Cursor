export interface CodeChunk {
  content: string;
  startLine: number;
  endLine: number;
  metadata: {
    language: string;
    filepath: string;
    symbols?: string[];
  };
}

export interface ChunkerOptions {
  chunkSize: number;
  chunkOverlap: number;
  respectSyntax?: boolean;
}

export class Chunker {
  private options: ChunkerOptions;

  constructor(options: Partial<ChunkerOptions> = {}) {
    this.options = {
      chunkSize: options.chunkSize || 512,
      chunkOverlap: options.chunkOverlap || 50,
      respectSyntax: options.respectSyntax !== false,
    };
  }

  chunkText(text: string, filepath: string, language: string): CodeChunk[] {
    const lines = text.split('\n');
    const chunks: CodeChunk[] = [];
    
    let currentChunk: string[] = [];
    let startLine = 0;

    for (let i = 0; i < lines.length; i++) {
      currentChunk.push(lines[i]);
      
      const currentLength = currentChunk.join('\n').length;
      
      if (currentLength >= this.options.chunkSize || i === lines.length - 1) {
        if (currentChunk.length > 0) {
          chunks.push({
            content: currentChunk.join('\n'),
            startLine: startLine,
            endLine: i,
            metadata: {
              language,
              filepath,
              symbols: this.extractSymbols(currentChunk.join('\n'), language),
            },
          });

          const overlapLines = Math.ceil(this.options.chunkOverlap / 50);
          currentChunk = currentChunk.slice(-overlapLines);
          startLine = i - overlapLines + 1;
        }
      }
    }

    return chunks;
  }

  chunkCode(code: string, filepath: string, language: string): CodeChunk[] {
    if (!this.options.respectSyntax) {
      return this.chunkText(code, filepath, language);
    }

    switch (language) {
      case 'typescript':
      case 'javascript':
        return this.chunkJavaScript(code, filepath, language);
      case 'python':
        return this.chunkPython(code, filepath, language);
      default:
        return this.chunkText(code, filepath, language);
    }
  }

  private chunkJavaScript(code: string, filepath: string, language: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const lines = code.split('\n');
    
    const functionRegex = /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/;
    const classRegex = /^\s*(?:export\s+)?class\s+(\w+)/;
    const methodRegex = /^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/;

    let currentChunk: string[] = [];
    let startLine = 0;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentChunk.push(line);

      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      const isFunction = functionRegex.test(line);
      const isClass = classRegex.test(line);
      
      if ((braceDepth === 0 && (isFunction || isClass) && i > startLine) ||
          currentChunk.join('\n').length >= this.options.chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push({
            content: currentChunk.join('\n'),
            startLine,
            endLine: i,
            metadata: {
              language,
              filepath,
              symbols: this.extractSymbols(currentChunk.join('\n'), language),
            },
          });
          currentChunk = [];
          startLine = i + 1;
        }
      }
    }

    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join('\n'),
        startLine,
        endLine: lines.length - 1,
        metadata: {
          language,
          filepath,
          symbols: this.extractSymbols(currentChunk.join('\n'), language),
        },
      });
    }

    return chunks;
  }

  private chunkPython(code: string, filepath: string, language: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const lines = code.split('\n');
    
    const defRegex = /^\s*def\s+(\w+)/;
    const classRegex = /^\s*class\s+(\w+)/;

    let currentChunk: string[] = [];
    let startLine = 0;
    let currentIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.search(/\S/);
      
      if ((defRegex.test(line) || classRegex.test(line)) && currentChunk.length > 0 && indent <= currentIndent) {
        chunks.push({
          content: currentChunk.join('\n'),
          startLine,
          endLine: i - 1,
          metadata: {
            language,
            filepath,
            symbols: this.extractSymbols(currentChunk.join('\n'), language),
          },
        });
        currentChunk = [];
        startLine = i;
        currentIndent = indent;
      }

      currentChunk.push(line);

      if (currentChunk.join('\n').length >= this.options.chunkSize && i < lines.length - 1) {
        chunks.push({
          content: currentChunk.join('\n'),
          startLine,
          endLine: i,
          metadata: {
            language,
            filepath,
            symbols: this.extractSymbols(currentChunk.join('\n'), language),
          },
        });
        currentChunk = [];
        startLine = i + 1;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join('\n'),
        startLine,
        endLine: lines.length - 1,
        metadata: {
          language,
          filepath,
          symbols: this.extractSymbols(currentChunk.join('\n'), language),
        },
      });
    }

    return chunks;
  }

  private extractSymbols(code: string, language: string): string[] {
    const symbols: string[] = [];
    
    const patterns: Record<string, RegExp[]> = {
      typescript: [
        /(?:function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      ],
      javascript: [
        /(?:function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      ],
      python: [
        /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      ],
    };

    const languagePatterns = patterns[language] || [];
    
    for (const pattern of languagePatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        symbols.push(match[1]);
      }
    }

    return [...new Set(symbols)];
  }
}
