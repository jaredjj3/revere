import { flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { RevereError } from '../../../errors';
import { $messages, $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

export default class Show extends ExitImmediatelyCommand {
  static description = 'shows run details';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
    id: flags.integer({ char: 'i', required: true, description: 'the id of the run' }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Show);

    const id = flags.id;

    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);
    const run = await prisma.commandRun.findFirst({ where: { id } });
    if (!run) {
      throw new RevereError(`job not found with id '${id}', list runs using the \`runs:list\` command`);
    }

    const message = $messages.commandRun(run);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(notifiers, message);
  }
}
