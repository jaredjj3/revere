import { flags } from '@oclif/command';
import { $notifiers } from '../../helpers';

export type BooleanString = 'true' | 'false';

export const booleanString = flags.build({
  parse: (input) => input === 'true',
  options: ['true', 'false'],
});

/**
 * The { multiple: true } value doesn't work well for flag builders so we
 * use a regular function. The downside is that callers can't further
 * customize this flag.
 */
export const notifiers = (): flags.IOptionFlag<string[]> => {
  return flags.string({
    multiple: true,
    options: $notifiers.ALLOWED_NOTIFIERS,
    default: $notifiers.getDefaultNotifiers(),
    description: 'the notifiers that will send notifications',
  });
};
