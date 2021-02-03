import { Message } from '../messages';

export interface Notifier {
  notify(message: Message): Promise<void>;
}
