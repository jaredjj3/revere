import { Command, flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { NotImplementedError, RevereError } from '../errors';
import { DEFAULT_NOTIFIERS, getNotifier, notify } from '../helpers';
import { Notifier } from '../notifiers';
import { CrudAction, CrudActions } from '../util';

export default class Jobs extends Command {
  static description = 'describe the command here';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
    name: flags.string(),
  };

  static args = [{ name: 'operation', required: true, options: CrudActions, hidden: false }];

  private prisma = new PrismaClient();

  async run(): Promise<void> {
    const { args, flags } = this.parse(Jobs);

    const notifiers = flags.notifiers.map(getNotifier);

    switch (args.operation) {
      case CrudAction.CREATE:
        await this.create();
        break;
      case CrudAction.SHOW:
        if (!flags.name) {
          throw new RevereError(`missing flag: 'name'`);
        }
        await this.show(notifiers, flags.name);
        break;
      case CrudAction.UPDATE:
        await this.update();
        break;
      case CrudAction.LIST:
        await this.list(notifiers);
        break;
      default:
        throw new RevereError(`unknown operation: ${args.operation}`);
    }

    this.exit(0);
  }

  async create(): Promise<void> {
    throw new NotImplementedError();
  }

  async show(notifiers: Notifier[], name: string): Promise<void> {
    const job = await this.prisma.job.findFirst({ where: { name } });
    if (job) {
      await notify(notifiers, JSON.stringify(job, null, 2));
    } else {
      await notify(notifiers, `no job found with name: '${name}'`);
    }
  }

  async update(): Promise<void> {
    throw new NotImplementedError();
  }

  async list(notifiers: Notifier[]): Promise<void> {
    const jobs = await this.prisma.job.findMany();
    await notify(notifiers, JSON.stringify(jobs, null, 2));
  }
}
