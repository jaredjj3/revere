import { flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { cli } from 'cli-ux';
import { $messages, $notifiers } from '../../../helpers';
import { notifyAll } from '../../../helpers/notifiers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { BaseCommand } from '../../BaseCommand';
import { $flags } from '../../flags';

export default class List extends BaseCommand {
  static description = 'list command runs';

  static flags = {
    help: flags.help({ char: 'h' }),
    limit: flags.integer({ char: 'l', default: 10 }),
    notifiers: $flags.notifiers(),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(List);

    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);
    const commandRuns = await prisma.commandRun.findMany({ orderBy: { startedAt: 'desc' }, take: flags.limit });

    const lines = new Array<string>();
    cli.table(
      commandRuns,
      {
        id: {
          header: 'id',
          get: (commandRun) => commandRun.id,
        },
        command: {
          header: 'command',
          get: (commandRun) => commandRun.command,
        },
        src: {
          header: 'src',
          get: (commandRun) => commandRun.src,
        },
        status: {
          header: 'status',
          get: (commandRun) => commandRun.status,
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
    await notifyAll(notifiers, message);
    this.exit(0);
  }
}
