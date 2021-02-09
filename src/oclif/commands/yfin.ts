import { flags } from '@oclif/command';
import { difference } from 'lodash';
import { YFinanceApi, YFinanceApiInfoResponse } from '../../apis';
import { RevereError } from '../../errors';
import { $messages, $notifiers } from '../../helpers';
import { container } from '../../inversify.config';
import { TYPES } from '../../inversify.constants';
import { Notifier } from '../../notifiers';
import { BaseCommand } from '../../oclif';

type InfoFlags = {
  symbols: string[];
  fields?: string[];
};

export default class Yfin extends BaseCommand {
  static description = 'get data from the yahoo finance api';

  static flags = {
    help: flags.help({ char: 'h' }),
    symbols: flags.string({ char: 's', multiple: true }),
    notifiers: flags.string({ char: 'n', multiple: true, default: $notifiers.DEFAULT_NOTIFIERS }),
    fields: flags.string({ char: 'f', multiple: true }),
  };

  static args = [{ name: 'subcommand', required: true, options: ['info'], hidden: false }];

  async run(): Promise<void> {
    const { args, flags } = this.parse(Yfin);

    const notifiers = flags.notifiers.map($notifiers.getNotifier);

    switch (args.subcommand) {
      case 'info':
        this.validate<InfoFlags>([Yfin.flags.symbols.name], flags);
        await this.info(notifiers, flags as InfoFlags);
        break;
      default:
        throw new RevereError(`unknown operations: ${args.subcommand}`);
    }

    this.exit(0);
  }

  async info(notifiers: Notifier[], flags: InfoFlags): Promise<void> {
    const api = container.get<YFinanceApi>(TYPES.YFinanceApi);
    const infos = await Promise.all(flags.symbols.map((symbol) => api.getInfo(symbol)));
    const messages = infos.map((info) =>
      $messages.createYFinanceInfoMessage({
        content: 'from the yfinance api',
        data: info,
        fields: (flags.fields as Array<keyof YFinanceApiInfoResponse> | undefined) || [],
      })
    );
    await $notifiers.notifyAll(notifiers, ...messages);
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