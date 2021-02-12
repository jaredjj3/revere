export enum MessageType {
  Unknown = 'Unknown',
  Simple = 'Simple',
  Complex = 'Complex',
}

export enum Severity {
  Info,
  Warning,
  Alert,
  Emergency,
}

export type MessageByType = {
  [MessageType.Unknown]: Message;
  [MessageType.Simple]: SimpleMessage;
  [MessageType.Complex]: ComplexMessage;
};

export type Message = {
  type: MessageType;
  timestamp: Date;
  severity: Severity;
  description: string;
};

export type SimpleMessage = Message & {
  type: MessageType.Simple;
};

export type ComplexField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type ComplexMessage = Message & {
  type: MessageType.Complex;
  author?: string;
  title?: string;
  fields: ComplexField[];
  url?: string;
  color?: string;
  image?: string;
  footer?: string;
};
