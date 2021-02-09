import { CommandRun } from '@prisma/client';
import { YFinanceApiInfoResponse } from '../apis';

export enum MessageType {
  None = 'None',
  Stdout = 'Stdout',
  Squoze = 'Squoze',
  YfinInfo = 'YfinInfo',
  Help = 'Help',
  CommandRun = 'CommandRun',
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

export type CommandRunMessage = Message & {
  type: MessageType.CommandRun;
  commandRun: CommandRun;
};
