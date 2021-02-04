import { spawn } from 'child_process';
import * as Discord from 'discord.js';
import { injectable } from 'inversify';
import { DiscordClientProvider } from '../discord';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.types';
import { MessageType, Severity } from '../messages';
import { Notifier } from '../notifiers';
import { env } from '../util';
import { Listener } from './types';

const COMMAND_PREFIXES = ['!revere', '!r'];
const BANNED_COMMANDS = ['subscribe'];
const COMMAND_TIMEOUT_MS = 5000;

@injectable()
export class DiscordListener implements Listener {
  async listen(notifiers: Notifier[]): Promise<void> {
    const client = await this.getClient();
    client.on('message', this.onMessage(notifiers));
    console.log('listening for messages...');
  }

  async getClient(): Promise<Discord.Client> {
    const clientProvider = container.get<DiscordClientProvider>(TYPES.DiscordClientProvider);
    const client = await clientProvider();
    return client;
  }

  onMessage = (notifiers: Notifier[]) => async (message: Discord.Message): Promise<void> => {
    const client = await this.getClient();

    if (message.author.id === client.user?.id) {
      console.debug('skipped own message');
      return;
    }
    if (!this.isCommand(message.content)) {
      console.debug('skipped non-command');
      return;
    }
    if (message.channel.id !== env('CHANNEL_ID')) {
      console.debug(`skipped message for another channel: ${message.channel.id}`);
      return;
    }

    const commandStr = message.content;

    try {
      console.log(`received commandStr from discord: ${commandStr}`);
      const argv = this.getArgv(commandStr);
      const output = await this.spawnRun(argv);
      this.notify(notifiers, `successfully ran command: '${commandStr}'\n\n${output}`);
    } catch (err) {
      console.error(err);
      this.notify(notifiers, `unsuccessfully ran command: '${commandStr}'\n\n${err.message}`);
    }
  };

  private async notify(notifiers: Notifier[], content: string): Promise<void> {
    await Promise.all(
      notifiers.map((notifier) =>
        notifier.notify({
          type: MessageType.Stdout,
          timestamp: new Date(),
          severity: Severity.Info,
          content,
        })
      )
    );
  }

  private isCommand(str: string): boolean {
    return COMMAND_PREFIXES.some((prefix) => str.startsWith(prefix));
  }

  private getArgv(str: string): string[] {
    const trimmed = str.trim();
    // TODO sanitize input?
    const splitted = trimmed.split(' ');
    const sliced = splitted.slice(1); // drop the COMMAND_PREFIX
    return sliced;
  }

  private async spawnRun(argv: string[]): Promise<string> {
    const command = argv[0];
    if (BANNED_COMMANDS.includes(command)) {
      throw new RevereError(`banned command: '${command}'`);
    }

    const run = spawn('bin/run', argv, { shell: false });

    const buffer = new Array<string>();

    run.stdout.on('data', (chunk: Buffer) => {
      buffer.push(chunk.toString());
    });

    run.stderr.on('data', (chunk: Buffer) => {
      buffer.push(chunk.toString());
    });

    const close = new Promise<string>((resolve, reject) => {
      run.on('close', () => {
        const str = buffer.join('');
        if (run.exitCode === 0) {
          resolve(str);
        } else {
          reject(new RevereError(`${str}\n\nnon-zero exit code: ${run.exitCode}`));
        }
      });
    });

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        run.kill();
        reject(new RevereError(`timed out after ${COMMAND_TIMEOUT_MS}ms`));
      }, COMMAND_TIMEOUT_MS);
    });

    return await Promise.race<string>([close, timeout]);
  }
}
