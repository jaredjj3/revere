import { Message } from '../messages';

export enum NotifierName {
  Console = 'console',
  Discord = 'discord',
}

export interface Notifier {
  notify(message: Message): Promise<void>;
}
