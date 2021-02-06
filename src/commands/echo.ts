import { Command, flags } from '@oclif/command';

export default class Echo extends Command {
  static description = 'prints the arguments to stdout';

  static strict = false;

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [{ name: 'string', required: true }];

  async run(): Promise<void> {
    const { argv } = this.parse(Echo);
    this.log(argv.join(' '));
    this.exit(0);
  }
}
