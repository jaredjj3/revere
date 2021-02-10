import { CommandRun } from '@prisma/client';
import { YFinanceApiInfoResponse } from '../apis';

export enum MessageType {
  None = 'None',
  Stdout = 'Stdout',
  Squoze = 'Squoze',
  YFinanceInfo = 'YfinInfo',
  Help = 'Help',
  CommandRun = 'CommandRun',
}

export enum Severity {
  Info,
  Warning,
  Alert,
  Emergency,
}

export type MessageByType = {
  [MessageType.None]: Message;
  [MessageType.Stdout]: StdoutMessage;
  [MessageType.Squoze]: SquozeMessage;
  [MessageType.YFinanceInfo]: YFinanceInfoMessage;
  [MessageType.Help]: HelpMessage;
  [MessageType.CommandRun]: CommandRunMessage;
};

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
  type: MessageType.YFinanceInfo;
  data: YFinanceApiInfoResponse;
  fields: Array<keyof YFinanceApiInfoResponse>;
};

export type HelpMessage = Message & {
  type: MessageType.Help;
  commandRun: CommandRun;
};

export type CommandRunMessage = Message & {
  type: MessageType.CommandRun;
  commandRun: CommandRun;
};
