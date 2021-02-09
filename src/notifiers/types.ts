import { Message } from '../messages';

export interface Notifier {
  notify<M extends Message>(message: M): Promise<void>;
}
