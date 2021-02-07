import { CommandRunSrc, Job, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import * as cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { TYPES } from '../inversify.constants';
import { onExit } from '../util';
import { CommandRunner } from './CommandRunner';

type Run = { job: Job; task: ScheduledTask };

@injectable()
export class JobRunner {
  private runs = new Array<Run>();
  private syncJobsTask: ScheduledTask | null = null;

  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.CommandRunner) private commandRunner: CommandRunner
  ) {}

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
    console.log('\nsyncJob CURRENT');
    console.log(`running jobs: ${this.runs.map((run) => run.job.name)}\n`);

    // no mutations
    const [active, inactive, updated] = await Promise.all([
      this.getNewlyActiveJobs(),
      this.getNewlyInactiveJobs(),
      this.getNewlyUpdatedJobs(),
    ]);

    const getName = (job: Job) => job.name;
    console.log('\nsyncJob CHANGES');
    console.log(`active jobs: ${active.map(getName).join(', ')}`);
    console.log(`inactive jobs: ${inactive.map(getName).join(', ')}`);
    console.log(`updated jobs: ${updated.map(getName).join(', ')}\n`);

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
    const jobIds = this.runs.map((run) => run.job.id);
    const jobs = await this.prisma.job.findMany({ where: { active: true, id: { in: jobIds } } });
    const runByJobId = Object.fromEntries(this.runs.map((run) => [run.job.id, run.job]));
    return jobs.filter((job) => job.updatedAt > runByJobId[job.id].updatedAt);
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
    this.runs = this.runs.filter((run) => run.job.id !== job.id);
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
      const commandRun = await this.commandRunner.run(job.command.split(' '), { src: CommandRunSrc.JOB });
      console.log(
        `\nJOB ${job.name} START=======================\n${[commandRun.stdout, commandRun.stderr]
          .filter((str) => str.length > 0)
          .join('\n')}\nJOB ${job.name} END=======================`
      );
    } catch (err) {
      console.error(err);
    }
  }
}
