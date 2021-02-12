import { flags } from '@oclif/command';
import { Prisma, PrismaClient } from '@prisma/client';
import { cli } from 'cli-ux';
import { isUndefined } from 'lodash';
import { $messages, $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

export default class List extends ExitImmediatelyCommand {
  static description = 'list jobs';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
    active: $flags.booleanString(),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(List);

    const args: Partial<Prisma.JobFindManyArgs> = { orderBy: { id: 'asc' } };
    args.where = {}; // make the compiler happy
    if (!isUndefined(flags.active)) {
      args.where.active = flags.active;
    }
    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);
    const jobs = await prisma.job.findMany(args);

    const lines = new Array<string>();
    cli.table(
      jobs,
      {
        id: {
          header: 'id',
          get: (job) => job.id,
        },
        name: {
          header: 'name',
          get: (job) => job.name,
        },
        active: {
          header: 'active',
          get: (job) => job.active,
        },
      },
      {
        printLine: (line: string) => {
          lines.push(line);
        },
      }
    );

    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    const message = $messages.stdout(lines.join('\n'));
    await $notifiers.notifyAll(notifiers, message);
  }
}
