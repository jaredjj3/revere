import { flags } from '@oclif/command';

export type BooleanString = 'true' | 'false';

export const booleanString = flags.build({
  parse: (input) => input === 'true',
  options: ['true', 'false'],
});
