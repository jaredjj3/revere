import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { NAMES, TYPES } from '../inversify.constants';
import { MessageType, Severity } from '../messages';
import { Notifier } from '../notifiers';
import { env } from '../util';

const CMD_INPUT_SRC = env('CMD_INPUT_SRC');
export const ALLOWED_NOTIFIERS = [NAMES.console, NAMES.discord];
export const DEFAULT_NOTIFIERS = CMD_INPUT_SRC.toLowerCase() === NAMES.discord ? [NAMES.discord] : [NAMES.console];

export const notify = async (notifiers: Notifier[], content: string): Promise<void> => {
  const timestamp = new Date();
  await Promise.all(
    notifiers.map((notifier) =>
      notifier.notify({ type: MessageType.Stdout, content, severity: Severity.Info, timestamp })
    )
  );
};

export const getNotifier = (notifierName: string): Notifier => {
  if (!ALLOWED_NOTIFIERS.includes(notifierName)) {
    throw new RevereError(`notifier not allowed: ${notifierName}`);
  }
  return container.getNamed<Notifier>(TYPES.Notifier, notifierName);
};
