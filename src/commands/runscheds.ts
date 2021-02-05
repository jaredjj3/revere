import { Command, flags } from '@oclif/command';
import { PrismaClient, Schedule } from '@prisma/client';
import * as cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { container } from '../inversify.config';
import { NAMES, TYPES } from '../inversify.constants';
import { MessageType, Severity } from '../messages';
import { DiscordNotifier } from '../notifiers';

export default class Runscheds extends Command {
  static description = 'describe the command here';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  prisma = new PrismaClient();
  mainTask: ScheduledTask | null = null;
  tasksById: { [key: number]: ScheduledTask } = {};

  async run(): Promise<void> {
    this.parse(Runscheds);

    this.mainTask = cron.schedule('* * * * *', async () => {
      await this.runSchedules();
    });
  }

  async runSchedules(): Promise<void> {
    const notifier = container.getNamed<DiscordNotifier>(TYPES.Notifier, NAMES.discord);
    const schedules = await this.findAwaitingActiveSchedules();
    for (const schedule of schedules) {
      if (schedule.id in this.tasksById) {
        continue;
      }
      const task = cron.schedule(schedule.cronExpression, () => {
        const timestamp = new Date();
        notifier.notify({
          type: MessageType.Stdout,
          timestamp,
          content: `i was going to run schedule: ${JSON.stringify(schedule, null, 2)}`,
          severity: Severity.Info,
        });
      });
      this.tasksById[schedule.id] = task;
    }
  }

  async findAwaitingActiveSchedules(): Promise<Schedule[]> {
    const scheduleIds = Object.keys(this.tasksById).map(Number);
    return await this.prisma.schedule.findMany({
      where: { active: true, NOT: { id: { in: scheduleIds } } },
    });
  }
}
