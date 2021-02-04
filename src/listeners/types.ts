import { Notifier } from '../notifiers';

export interface Listener {
  listen(notifiers: Notifier[]): Promise<void>;
}
