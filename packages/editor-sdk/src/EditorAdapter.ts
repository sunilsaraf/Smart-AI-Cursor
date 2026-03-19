import type {
  EditorContext,
  Selection,
  FileEdit,
  TextEdit,
  CompletionItem,
  Diagnostic,
  DiffView,
  Position,
  Range,
  EditorOptions,
} from './types';

export abstract class EditorAdapter {
  abstract getName(): string;
  abstract getVersion(): string;

  abstract getContext(): Promise<EditorContext>;
  
  abstract getSelection(): Promise<Selection | null>;
  
  abstract getCursorPosition(): Promise<Position>;
  
  abstract getActiveFilePath(): Promise<string | null>;
  
  abstract getActiveFileContent(): Promise<string | null>;
  
  abstract openFile(filePath: string): Promise<void>;
  
  abstract closeFile(filePath: string): Promise<void>;
  
  abstract saveFile(filePath: string): Promise<void>;
  
  abstract applyEdit(edit: FileEdit): Promise<boolean>;
  
  abstract applyEdits(edits: FileEdit[]): Promise<boolean>;
  
  abstract insertText(text: string, position?: Position): Promise<boolean>;
  
  abstract replaceRange(range: Range, newText: string): Promise<boolean>;
  
  abstract deleteRange(range: Range): Promise<boolean>;
  
  abstract setSelection(selection: Selection): Promise<void>;
  
  abstract setCursorPosition(position: Position): Promise<void>;
  
  abstract showDiff(diff: DiffView): Promise<void>;
  
  abstract getDiagnostics(filePath: string): Promise<Diagnostic[]>;
  
  abstract showMessage(message: string, level: 'info' | 'warning' | 'error'): Promise<void>;
  
  abstract showQuickPick(items: string[], title?: string): Promise<string | null>;
  
  abstract showInputBox(prompt: string, defaultValue?: string): Promise<string | null>;
  
  abstract getCompletions(
    filePath: string,
    position: Position
  ): Promise<CompletionItem[]>;
  
  abstract getOptions(): Promise<EditorOptions>;
  
  abstract setOptions(options: Partial<EditorOptions>): Promise<void>;
  
  abstract getWorkspaceRoot(): Promise<string | null>;
  
  abstract getOpenFiles(): Promise<string[]>;
  
  abstract executeCommand(command: string, ...args: any[]): Promise<any>;
  
  abstract onDidChangeTextDocument(
    callback: (filePath: string, changes: TextEdit[]) => void
  ): () => void;
  
  abstract onDidChangeSelection(
    callback: (selection: Selection) => void
  ): () => void;
  
  abstract onDidSaveTextDocument(
    callback: (filePath: string) => void
  ): () => void;
}

export class MonacoEditorAdapter extends EditorAdapter {
  constructor(private editor: any) {
    super();
  }

  getName(): string {
    return 'Monaco Editor';
  }

  getVersion(): string {
    return '0.45.0';
  }

  async getContext(): Promise<EditorContext> {
    const model = this.editor.getModel();
    const selection = this.editor.getSelection();
    const position = this.editor.getPosition();
    const visibleRanges = this.editor.getVisibleRanges();

    return {
      filePath: model?.uri?.path || '',
      languageId: model?.getLanguageId() || '',
      content: model?.getValue() || '',
      selection: selection ? this.convertSelection(selection) : undefined,
      cursorPosition: this.convertPosition(position),
      visibleRange: visibleRanges[0] ? this.convertRange(visibleRanges[0]) : {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      },
    };
  }

  async getSelection(): Promise<Selection | null> {
    const selection = this.editor.getSelection();
    return selection ? this.convertSelection(selection) : null;
  }

  async getCursorPosition(): Promise<Position> {
    return this.convertPosition(this.editor.getPosition());
  }

  async getActiveFilePath(): Promise<string | null> {
    return this.editor.getModel()?.uri?.path || null;
  }

  async getActiveFileContent(): Promise<string | null> {
    return this.editor.getModel()?.getValue() || null;
  }

  private convertPosition(pos: any): Position {
    return {
      line: pos.lineNumber - 1,
      character: pos.column - 1,
    };
  }

  private convertRange(range: any): Range {
    return {
      start: this.convertPosition({ lineNumber: range.startLineNumber, column: range.startColumn }),
      end: this.convertPosition({ lineNumber: range.endLineNumber, column: range.endColumn }),
    };
  }

  private convertSelection(selection: any): Selection {
    return {
      start: this.convertPosition({ lineNumber: selection.startLineNumber, column: selection.startColumn }),
      end: this.convertPosition({ lineNumber: selection.endLineNumber, column: selection.endColumn }),
      anchor: this.convertPosition({ lineNumber: selection.selectionStartLineNumber, column: selection.selectionStartColumn }),
      active: this.convertPosition({ lineNumber: selection.positionLineNumber, column: selection.positionColumn }),
      isReversed: selection.getDirection() === 1,
    };
  }

  async openFile(filePath: string): Promise<void> {
    throw new Error('Not implemented in Monaco adapter');
  }

  async closeFile(filePath: string): Promise<void> {
    throw new Error('Not implemented in Monaco adapter');
  }

  async saveFile(filePath: string): Promise<void> {
    throw new Error('Not implemented in Monaco adapter');
  }

  async applyEdit(edit: FileEdit): Promise<boolean> {
    const model = this.editor.getModel();
    if (!model) return false;
    
    this.editor.executeEdits('codepilot', edit.edits.map(e => ({
      range: this.toMonacoRange(e.range),
      text: e.newText,
    })));
    
    return true;
  }

  async applyEdits(edits: FileEdit[]): Promise<boolean> {
    for (const edit of edits) {
      await this.applyEdit(edit);
    }
    return true;
  }

  async insertText(text: string, position?: Position): Promise<boolean> {
    const pos = position || await this.getCursorPosition();
    const range = { start: pos, end: pos };
    return this.applyEdit({
      filePath: await this.getActiveFilePath() || '',
      edits: [{ range, newText: text }],
    });
  }

  async replaceRange(range: Range, newText: string): Promise<boolean> {
    return this.applyEdit({
      filePath: await this.getActiveFilePath() || '',
      edits: [{ range, newText }],
    });
  }

  async deleteRange(range: Range): Promise<boolean> {
    return this.replaceRange(range, '');
  }

  async setSelection(selection: Selection): Promise<void> {
    this.editor.setSelection(this.toMonacoRange(selection));
  }

  async setCursorPosition(position: Position): Promise<void> {
    this.editor.setPosition({
      lineNumber: position.line + 1,
      column: position.character + 1,
    });
  }

  async showDiff(diff: DiffView): Promise<void> {
    throw new Error('Diff view not implemented in Monaco adapter');
  }

  async getDiagnostics(filePath: string): Promise<Diagnostic[]> {
    return [];
  }

  async showMessage(message: string, level: 'info' | 'warning' | 'error'): Promise<void> {
    console.log(`[${level}] ${message}`);
  }

  async showQuickPick(items: string[], title?: string): Promise<string | null> {
    return null;
  }

  async showInputBox(prompt: string, defaultValue?: string): Promise<string | null> {
    return null;
  }

  async getCompletions(filePath: string, position: Position): Promise<CompletionItem[]> {
    return [];
  }

  async getOptions(): Promise<EditorOptions> {
    const options = this.editor.getOptions();
    return {
      tabSize: options.get(this.editor.EditorOption.tabSize),
      insertSpaces: options.get(this.editor.EditorOption.insertSpaces),
      fontSize: options.get(this.editor.EditorOption.fontSize),
      fontFamily: options.get(this.editor.EditorOption.fontFamily),
      lineHeight: options.get(this.editor.EditorOption.lineHeight),
      theme: 'light',
    };
  }

  async setOptions(options: Partial<EditorOptions>): Promise<void> {
    this.editor.updateOptions(options);
  }

  async getWorkspaceRoot(): Promise<string | null> {
    return null;
  }

  async getOpenFiles(): Promise<string[]> {
    return [];
  }

  async executeCommand(command: string, ...args: any[]): Promise<any> {
    throw new Error('Command execution not supported in Monaco adapter');
  }

  onDidChangeTextDocument(callback: (filePath: string, changes: TextEdit[]) => void): () => void {
    const disposable = this.editor.onDidChangeModelContent(() => {
      const filePath = this.editor.getModel()?.uri?.path || '';
      callback(filePath, []);
    });
    return () => disposable.dispose();
  }

  onDidChangeSelection(callback: (selection: Selection) => void): () => void {
    const disposable = this.editor.onDidChangeCursorSelection((e: any) => {
      callback(this.convertSelection(e.selection));
    });
    return () => disposable.dispose();
  }

  onDidSaveTextDocument(callback: (filePath: string) => void): () => void {
    return () => {};
  }

  private toMonacoRange(range: Range): any {
    return {
      startLineNumber: range.start.line + 1,
      startColumn: range.start.character + 1,
      endLineNumber: range.end.line + 1,
      endColumn: range.end.character + 1,
    };
  }
}
