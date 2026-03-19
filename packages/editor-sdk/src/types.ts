export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Selection extends Range {
  anchor: Position;
  active: Position;
  isReversed: boolean;
}

export interface EditorContext {
  filePath: string;
  languageId: string;
  content: string;
  selection?: Selection;
  cursorPosition: Position;
  visibleRange: Range;
}

export interface Diagnostic {
  range: Range;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  source?: string;
  code?: string | number;
}

export interface FileEdit {
  filePath: string;
  edits: TextEdit[];
}

export interface TextEdit {
  range: Range;
  newText: string;
}

export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText: string;
  range: Range;
  sortText?: string;
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25,
}

export interface DiffView {
  original: string;
  modified: string;
  language: string;
}

export interface EditorOptions {
  tabSize: number;
  insertSpaces: boolean;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark';
}
