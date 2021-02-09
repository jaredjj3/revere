import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { NAMES, TYPES } from '../inversify.constants';
import { Listener } from '../listeners';
import { Notifier } from '../notifiers';

export const ALLOWED_LISTENERS = [NAMES.console, NAMES.discord];
export const DEFAULT_LISTENERS = [NAMES.console];

export const getListener = (listenerName: string): Listener => {
  if (!ALLOWED_LISTENERS.includes(listenerName)) {
    throw new RevereError(`listener not allowed: ${listenerName}`);
  }
  return container.getNamed<Listener>(TYPES.Listener, listenerName);
};

export const listenAll = async (listeners: Listener[], notifiers: Notifier[]): Promise<void> => {
  await Promise.all(listeners.map((listener) => listener.listen(notifiers)));
};
