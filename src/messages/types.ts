export enum MessageType {
  None = 'None',
  Stdout = 'Stdout',
  Squoze = 'Squoze',
}

export enum Severity {
  Info,
  Warning,
  Alert,
  Emergency,
}

export type Message = {
  type: MessageType;
  timestamp: Date;
  severity: Severity;
  content: string;
};

export type StdoutMessage = Message & {
  type: MessageType.Stdout;
};

export type SquozeMessage = Message & {
  type: MessageType.Squoze;
};
