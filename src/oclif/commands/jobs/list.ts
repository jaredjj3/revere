import { flags } from '@oclif/command';
import { Prisma, PrismaClient } from '@prisma/client';
import { cli } from 'cli-ux';
import { isUndefined } from 'lodash';
import { $customFlags, $messages, $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { BaseCommand } from '../../../oclif';

export default class List extends BaseCommand {
  static description = 'list jobs';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: $notifiers.DEFAULT_NOTIFIERS }),
    active: $customFlags.booleanString(),
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
        description: {
          header: 'description',
          get: (job) => job.description,
        },
        command: {
          header: 'command',
          get: (job) => job.command,
        },
        cronExpression: {
          header: 'cronExpression',
          get: (job) => job.cronExpression,
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
    const message = $messages.createStdoutMessage({ content: `\n${lines.join('\n')}` });
    await $notifiers.notifyAll(notifiers, $messages.createStdoutMessage(message));

    this.exit(0);
  }
}
