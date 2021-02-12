import { flags } from '@oclif/command';
import { container } from '../../inversify.config';
import { TYPES } from '../../inversify.constants';
import { logger } from '../../logger';
import { JobRunner } from '../../runners/JobRunner';
import { LongRunningCommand } from '../LongRunningCommand';

export default class Start extends LongRunningCommand {
  static hidden = true;
  static description = 'starts the job runner to run indefinitely';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    this.parse(Start);
    logger.debug('running jobs');
    const jobRunner = container.get<JobRunner>(TYPES.JobRunner);
    await jobRunner.run();
  }
}
