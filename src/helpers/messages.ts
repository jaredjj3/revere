import {
  HelpMessage,
  Message,
  MessageType,
  Severity,
  SquozeMessage,
  StdoutMessage,
  YFinanceInfoMessage,
} from '../messages';

export const createMessage = (attrs?: Partial<Message>): Message => {
  return {
    type: MessageType.None,
    content: '',
    severity: Severity.Info,
    timestamp: new Date(),
    ...attrs,
  };
};

export const createStdoutMessage = (attrs: Partial<StdoutMessage>): StdoutMessage => {
  return { ...createMessage(), type: MessageType.Stdout, ...attrs };
};

export const createSquozeMessage = (attrs: Partial<SquozeMessage>): SquozeMessage => {
  return { ...createMessage(), type: MessageType.Squoze, ...attrs };
};

export const createYFinanceInfoMessage = (
  attrs: Partial<YFinanceInfoMessage> & Pick<YFinanceInfoMessage, 'fields' | 'data'>
): YFinanceInfoMessage => {
  return { ...createMessage(), type: MessageType.YfinInfo, ...attrs };
};

export const createHelpMessage = (attrs: Partial<HelpMessage>): HelpMessage => {
  return { ...createMessage(), type: MessageType.Help, ...attrs };
};
