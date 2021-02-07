import { Message, MessageType, Severity, StdoutMessage } from '../messages';

export const createMessage = (attrs: Partial<Message>): Message => {
  return {
    type: MessageType.None,
    content: '',
    severity: Severity.Info,
    timestamp: new Date(),
    ...attrs,
  };
};

export const createStdoutMessage = (attrs: Partial<StdoutMessage>): StdoutMessage => {
  return { ...createMessage({}), type: MessageType.Stdout, ...attrs };
};

// export const createSquozeMessage = (attrs: Partial<SquozeMessage>):
