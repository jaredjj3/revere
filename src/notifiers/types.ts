import { Message } from '../messages';

export interface Notifier {
  notify<M extends Message>(...messages: M[]): Promise<void>;
}
