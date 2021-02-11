import { flags } from '@oclif/command';
import { YFinanceApi, YFinanceApiInfoResponse } from '../../../apis';
import { $messages, $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

export default class Info extends ExitImmediatelyCommand {
  static description = 'get basic info from the api';

  static flags = {
    help: flags.help({ char: 'h' }),
    symbols: flags.string({ char: 's', multiple: true, required: true }),
    notifiers: $flags.notifiers(),
    fields: flags.string({ char: 'f', multiple: true }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Info);

    const api = container.get<YFinanceApi>(TYPES.YFinanceApi);
    const datas = await Promise.all(flags.symbols.map((symbol) => api.getInfo(symbol)));
    const messages = datas.map((data) =>
      $messages.createYFinanceInfoMessage({
        data,
        content: 'from the yfinance api',
        fields: (flags.fields as Array<keyof YFinanceApiInfoResponse> | undefined) || [],
      })
    );

    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(notifiers, ...messages);
  }
}
