import { Command, flags } from '@oclif/command';
import { Prisma, PrismaClient } from '@prisma/client';
import { difference, isUndefined } from 'lodash';
import * as cron from 'node-cron';
import { RevereError } from '../errors';
import * as customFlags from '../flags';
import { DEFAULT_NOTIFIERS, getNotifier, notify } from '../helpers';
import { Notifier } from '../notifiers';
import { CrudAction, CrudActions } from '../util';

type ListFlags = {
  active?: boolean;
};

type ShowFlags = {
  name: string;
};

type UpdateFlags = {
  name: string;
  description?: string[];
  command?: string[];
  cronExpression?: string[];
  active?: boolean;
};

type CreateFlags = {
  name: string;
  description?: string[];
  command: string[];
  cronExpression: string[];
  active: boolean;
};

export default class Jobs extends Command {
  static description = 'list, create, update, and show jobs';

  static flags = {
    help: flags.help({ char: 'h' }),
    notifiers: flags.string({ char: 'n', multiple: true, default: DEFAULT_NOTIFIERS }),
    name: flags.string(),
    description: flags.string({ multiple: true }),
    command: flags.string({ multiple: true }),
    cronExpression: flags.string({ multiple: true }),
    active: customFlags.booleanString(),
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
        this.validate<UpdateFlags>([], flags);
        await this.update(notifiers, flags as UpdateFlags);
        break;
      case CrudAction.LIST:
        this.validate<ListFlags>([], flags);
        await this.list(notifiers, flags as ListFlags);
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

  async update(notifiers: Notifier[], flags: UpdateFlags): Promise<void> {
    const args: Partial<Prisma.JobUpdateArgs> = { where: { name: flags.name } };
    args.data = {};
    if (!isUndefined(flags.description)) {
      args.data.description = flags.description.join(' ');
    }
    if (!isUndefined(flags.cronExpression)) {
      args.data.description = flags.cronExpression.join(' ');
    }
    if (!isUndefined(flags.command)) {
      args.data.command = flags.command.join(' ');
    }
    if (!isUndefined(flags.active)) {
      args.data.active = flags.active;
    }
    const job = await this.prisma.job.update(args as any);
    await notify(notifiers, `updated job:\n${JSON.stringify(job, null, 2)}`);
  }

  async list(notifiers: Notifier[], flags: ListFlags): Promise<void> {
    const args: Partial<Prisma.JobFindManyArgs> = { where: {} };
    if (!isUndefined(flags.active)) {
      args.where!.active = flags.active;
    }
    const jobs = await this.prisma.job.findMany(args);
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
