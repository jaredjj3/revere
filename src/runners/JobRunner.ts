import { CommandRunSrc, Job, PrismaClient } from '@prisma/client';
import { injectable } from 'inversify';
import { minBy } from 'lodash';
import * as cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { onExit } from '../util';
import { CommandRunner } from './CommandRunner';

type Run = { job: Job; task: ScheduledTask };

@injectable()
export class JobRunner {
  private prisma = new PrismaClient();
  private runs = new Array<Run>();
  private syncJobsTask: ScheduledTask | null = null;

  async run(): Promise<void> {
    if (this.syncJobsTask) {
      return;
    }
    await this.syncJobs();
    this.syncJobsTask = cron.schedule('* * * * *', this.syncJobs.bind(this));
    onExit(() => {
      if (this.syncJobsTask) {
        this.syncJobsTask.destroy();
        this.runs.map((run) => run.task).forEach((task) => task.destroy());
      }
      this.syncJobsTask = null;
      process.exit(0);
    });
  }

  private async syncJobs(): Promise<void> {
    // no mutations
    const [active, inactive, updated] = await Promise.all([
      this.getNewlyActiveJobs(),
      this.getNewlyInactiveJobs(),
      this.getNewlyUpdatedJobs(),
    ]);

    // perform mutations
    await Promise.all(inactive.map(this.stopJob.bind(this)));
    await Promise.all(active.map(this.startJob.bind(this)));
    await Promise.all(updated.map(this.startJob.bind(this)));
  }

  private async getNewlyActiveJobs(): Promise<Job[]> {
    const jobIds = this.runs.map((run) => run.job.id);
    return await this.prisma.job.findMany({ where: { active: true, id: { notIn: jobIds } } });
  }

  private async getNewlyInactiveJobs(): Promise<Job[]> {
    const jobIds = this.runs.map((run) => run.job.id);
    return await this.prisma.job.findMany({ where: { active: false, id: { in: jobIds } } });
  }

  private async getNewlyUpdatedJobs(): Promise<Job[]> {
    const oldestRun = minBy(this.runs, (run) => run.job.updatedAt);
    const oldestUpdatedAt = oldestRun ? oldestRun.job.updatedAt : new Date(0);
    return await this.prisma.job.findMany({ where: { updatedAt: { gt: oldestUpdatedAt } } });
  }

  private startJob(job: Job): void {
    const hasRun = this.runs.some((run) => run.job.id === job.id);
    if (hasRun) {
      this.replaceRun(job);
    } else {
      this.createRun(job);
    }
  }

  private stopJob(job: Job): void {
    const run = this.runs.find((run) => run.job.id === job.id);
    if (!run) {
      return;
    }
    console.log(`stopping job: ${job.name}`);
    run.task.destroy();
    this.runs = this.runs.filter((run) => run.job.id === job.id);
  }

  private createRun(job: Job): void {
    console.log(`starting job: ${job.name}`);
    const run: Run = {
      job,
      task: cron.schedule(job.cronExpression, async () => {
        await this.runJobOnce(job);
      }),
    };
    this.runs.push(run);
  }

  private replaceRun(job: Job): void {
    this.stopJob(job);
    this.createRun(job);
  }

  private async runJobOnce(job: Job): Promise<void> {
    console.log(`running job: ${job.name}`);
    try {
      const commandRunner = container.get<CommandRunner>(TYPES.CommandRunner);
      await commandRunner.run(job.command.split(' '), { src: CommandRunSrc.JOB });
    } catch (err) {
      console.error(err);
    }
  }
}
