export enum MessageType {
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
  severity: Severity;
  detectedAt: Date;
  content: string;
};

export type SquozeMessage = Message & {
  type: MessageType.Squoze;
};
