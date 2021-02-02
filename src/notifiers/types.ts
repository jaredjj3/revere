import { Message } from '../messages';

export enum NotifierName {
  Console = 'console',
  Discord = 'discord',
}

export interface Notifier {
  name: NotifierName;
  notify(message: Message): Promise<void>;
}
