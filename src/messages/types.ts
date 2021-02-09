import { YFinanceApiInfoResponse } from '../apis';

export enum MessageType {
  None = 'None',
  Stdout = 'Stdout',
  Squoze = 'Squoze',
  YfinInfo = 'YfinInfo',
  Help = 'Help',
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

export type YFinanceInfoMessage = Message & {
  type: MessageType.YfinInfo;
  data: YFinanceApiInfoResponse;
  fields: Array<keyof YFinanceApiInfoResponse>;
};

export type HelpMessage = Message & {
  type: MessageType.Help;
};
