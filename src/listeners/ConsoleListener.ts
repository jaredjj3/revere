import { injectable } from 'inversify';
import { createInterface } from 'readline';
import { Notifier } from '../notifiers';
import { Listener } from './types';
import { notify, spawnRun } from './util';

const EXIT_COMMAND = 'exit';

@injectable()
export class ConsoleListener implements Listener {
  readline = createInterface({ input: process.stdin, output: process.stdout, prompt: 'revere> ' });

  async listen(notifiers: Notifier[]): Promise<void> {
    this.readline.on('line', this.onMessage(notifiers));
    process.on('SIGTERM', this.exit);
    process.on('SIGINT', this.exit);
    setTimeout(() => this.readline.prompt(true), 0); // flush main stack
  }

  onMessage = (notifiers: Notifier[]) => async (line: string): Promise<void> => {
    const trimmed = line.trim();

    if (trimmed === EXIT_COMMAND) {
      this.exit();
    }

    const argv = trimmed.split(' ');

    try {
      const output = await spawnRun(argv);
      notify(notifiers, output);
    } catch (err) {
      notify(notifiers, err.message);
    }

    this.readline.prompt(true);
  };

  exit = (): never => {
    console.log('farewell');
    process.exit(0);
  };
}
