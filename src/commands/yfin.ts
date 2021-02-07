import { Command, flags } from '@oclif/command';
import { difference, pick } from 'lodash';
import { YFinanceApi } from '../apis';
import { RevereError } from '../errors';
import { DEFAULT_NOTIFIERS, getNotifier, notify } from '../helpers';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { Notifier } from '../notifiers';

type InfoFlags = {
  symbol: string;
};

export default class Yfin extends Command {
  static description = 'describe the command here';

  static flags = {
    help: flags.help({ char: 'h' }),
    symbol: flags.string(),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
  };

  static args = [{ name: 'subcommand', required: true, options: ['info'], hidden: false }];

  async run(): Promise<void> {
    const { args, flags } = this.parse(Yfin);

    const notifiers = flags.notifiers.map(getNotifier);

    switch (args.subcommand) {
      case 'info':
        this.validate<InfoFlags>([], flags);
        await this.info(notifiers, flags as InfoFlags);
        break;
      default:
        throw new RevereError(`unknown operations: ${args.subcommand}`);
    }

    this.exit(0);
  }

  async info(notifiers: Notifier[], flags: InfoFlags): Promise<void> {
    const api = container.get<YFinanceApi>(TYPES.YFinanceApi);
    const info = await api.getInfo(flags.symbol);
    const data = pick(info, [
      'ask',
      'askSize',
      'averageDailyVolume10Day',
      'averageVolume',
      'averageVolume10days',
      'shortName',
    ]);
    await notify(notifiers, JSON.stringify(data, null, 2));
  }

  validate<T>(requiredFlagNames: string[], flags: unknown): flags is T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const missingFlagNames = difference(requiredFlagNames, Object.keys(flags as any));
    if (missingFlagNames.length) {
      throw new RevereError(`missing flags: ${missingFlagNames.join(', ')}`);
    }
    return true;
  }
}
