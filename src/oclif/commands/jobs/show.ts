import { flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { isUndefined } from 'lodash';
import { RevereError } from '../../../errors';
import { $messages, $notifiers } from '../../../helpers';
import { container } from '../../../inversify.config';
import { TYPES } from '../../../inversify.constants';
import { ExitImmediatelyCommand } from '../../ExitImmediatelyCommand';
import { $flags } from '../../flags';

export default class Show extends ExitImmediatelyCommand {
  static description = 'shows job details';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: $flags.notifiers(),
    id: flags.integer({ char: 'i', description: 'the id of the job' }),
    name: flags.string({ char: 'n', description: 'the name of the job' }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Show);

    const id = flags.id;
    const name = flags.name;

    if (isUndefined(id) && isUndefined(name)) {
      throw new RevereError(`must specify one of: --id, --name`);
    }

    const prisma = container.get<PrismaClient>(TYPES.PrismaClient);
    const job = await prisma.job.findFirst({ where: { OR: { id, name } } });
    if (!job) {
      const identifiers = new Array<string>();
      if (!isUndefined(id)) {
        identifiers.push(`id '${id}'`);
      }
      if (!isUndefined(name)) {
        identifiers.push(`name '${name}'`);
      }
      throw new RevereError(
        `job not found with ${identifiers.join(' OR ')}, list jobs using the \`jobs:list\` command`
      );
    }

    const message = $messages.job(job);
    const notifiers = flags.notifiers.map($notifiers.getNotifier);
    await $notifiers.notifyAll(notifiers, message);
  }
}
