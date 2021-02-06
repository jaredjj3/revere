import { Command, flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';
import { difference } from 'lodash';
import * as cron from 'node-cron';
import { NotImplementedError, RevereError } from '../errors';
import { DEFAULT_NOTIFIERS, getNotifier, notify } from '../helpers';
import { Notifier } from '../notifiers';
import { CrudAction, CrudActions } from '../util';

type ShowFlags = {
  name: string;
};

type CreateFlags = {
  name: string;
  description?: string[];
  command: string[];
  cronExpression: string[];
  active: boolean;
};

export default class Jobs extends Command {
  static description = 'describe the command here';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
    name: flags.string(),
    description: flags.string({ multiple: true }),
    command: flags.string({ multiple: true }),
    cronExpression: flags.string({ multiple: true }),
    active: flags.boolean({ default: true }),
  };

  static args = [{ name: 'operation', required: true, options: CrudActions, hidden: false }];

  private prisma = new PrismaClient();

  async run(): Promise<void> {
    const { args, flags } = this.parse(Jobs);

    const notifiers = flags.notifiers.map(getNotifier);

    switch (args.operation) {
      case CrudAction.CREATE:
        this.validate<CreateFlags>(
          [Jobs.flags.name.name, Jobs.flags.command.name, Jobs.flags.cronExpression.name, Jobs.flags.active.name],
          flags
        );
        await this.create(notifiers, flags as CreateFlags);
        break;
      case CrudAction.SHOW:
        this.validate<ShowFlags>([Jobs.flags.name.name], flags);
        await this.show(notifiers, flags as ShowFlags);
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

  async create(notifiers: Notifier[], flags: CreateFlags): Promise<void> {
    const cronExpression = flags.cronExpression.join(' ');
    if (!cron.validate(cronExpression)) {
      throw new RevereError(`invalid cron expression: ${flags.cronExpression}`);
    }
    const job = await this.prisma.job.create({
      data: {
        name: flags.name,
        description: flags.description ? flags.description.join(' ') : null,
        command: flags.command.join(' '),
        cronExpression,
        active: flags.active,
      },
    });
    await notify(notifiers, `created job:\n${JSON.stringify(job, null, 2)}`);
  }

  async show(notifiers: Notifier[], flags: ShowFlags): Promise<void> {
    const job = await this.prisma.job.findFirst({ where: { name: flags.name } });
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

  validate<T>(requiredFlagNames: string[], flags: unknown): flags is T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const missingFlagNames = difference(requiredFlagNames, Object.keys(flags as any));
    if (missingFlagNames.length) {
      throw new RevereError(`missing flags: ${missingFlagNames.join(', ')}`);
    }
    return true;
  }
}
