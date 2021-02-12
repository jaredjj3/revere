import { CommandRunSrc } from '@prisma/client';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { NAMES, TYPES } from '../inversify.constants';
import { Message } from '../messages';
import { Notifier } from '../notifiers';
import * as $util from './util';

export const ALLOWED_NOTIFIERS = [NAMES.console, NAMES.discord];

export const notifyAll = async <M extends Message>(notifiers: Notifier[], ...messages: M[]): Promise<void> => {
  await Promise.all(notifiers.map((notifier) => notifier.notify(...messages)));
};

export const getNotifier = (notifierName: string): Notifier => {
  if (!ALLOWED_NOTIFIERS.includes(notifierName)) {
    throw new RevereError(`notifier not allowed: ${notifierName}`);
  }
  return container.getNamed<Notifier>(TYPES.Notifier, notifierName);
};

export const getDefaultNotifiers = (): string[] => {
  switch ($util.env('CMD_INPUT_SRC').toUpperCase()) {
    case CommandRunSrc.DISCORD:
      return [NAMES.console, NAMES.discord];
    case CommandRunSrc.JOB:
      return [NAMES.console, NAMES.discord];
    default:
      return [NAMES.console];
  }
};
