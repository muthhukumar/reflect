export interface NotesSchema {
  title: string;
  content: Array<string>;
  search: Array<string>;
  source: Array<string>;
}

export interface ReportSchema {
  date: string;
  done: Array<string>;
  quote: Array<string>;
  notes: Array<string>;
}

export interface VimSchema {
  title: string;
  action: string;
  keyBinding: Array<string>;
  command: string;
  search: Array<string>;
}
