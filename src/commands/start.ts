import { flags } from '@oclif/command';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { BaseCommand } from '../oclif';
import { JobRunner } from '../runners/JobRunner';
import { logger } from '../util';

export default class Start extends BaseCommand {
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
