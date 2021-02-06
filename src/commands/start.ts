import { Command, flags } from '@oclif/command';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.constants';
import { JobRunner } from '../runners/JobRunner';

export default class Start extends Command {
  static hidden = true;
  static description = 'starts the job runner to run indefinitely';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    this.parse(Start);
    this.log('running jobs');
    const jobRunner = container.get<JobRunner>(TYPES.JobRunner);
    await jobRunner.run();
  }
}
