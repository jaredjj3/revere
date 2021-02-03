import { Command, flags } from '@oclif/command';
import { spawn } from 'child_process';
import * as Discord from 'discord.js';
import { RevereError } from '../errors';
import { container } from '../inversify.config';
import { TYPES } from '../inversify.types';
import { MessageType, Severity } from '../messages';
import { DiscordNotifier } from '../notifiers';
import { env } from '../util';

const COMMAND_PREFIX = '!revere';
const BANNED_COMMANDS = ['subscribe'];

export default class Subscribe extends Command {
  static description = 'subscribe to discord messages';

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', default: false }),
  };

  client = new Discord.Client();
  shouldReplyWithInfo = false;

  async run(): Promise<void> {
    const { flags } = this.parse(Subscribe);
    this.shouldReplyWithInfo = flags.debug;
    await this.setup();
    this.log('listening for messages...');
  }

  async onMessage(message: Discord.Message): Promise<void> {
    if (message.author.id === this.client.user?.id) {
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

    const notifier = container.get<DiscordNotifier>(TYPES.DiscordNotifier);
    const notify = async (content: string) => {
      if (this.shouldReplyWithInfo) {
        await notifier.notify({
          type: MessageType.Stdout,
          detectedAt: new Date(),
          severity: Severity.Info,
          content,
        });
      }
    };

    try {
      const commandStr = message.content;
      this.log(`received commandStr from discord: ${commandStr}`);
      const argv = message.content.split(' ').slice(1);
      const output = await this.spawnRun(argv);
      notify(output);
    } catch (err) {
      console.error(err);
      notify(err.message);
    }
  }

  private async setup(): Promise<void> {
    this.client.on('message', this.onMessage.bind(this));

    const ready = new Promise<void>((resolve) => {
      this.client.on('ready', resolve);
    });

    const botToken = env('BOT_TOKEN');
    const login = this.client.login(botToken);

    await Promise.all([ready, login]);
  }

  private isCommand(str: string): boolean {
    return str.startsWith(COMMAND_PREFIX);
  }

  private async spawnRun(argv: string[]): Promise<string> {
    const command = argv[0];
    if (BANNED_COMMANDS.includes(command)) {
      throw new RevereError(`cannot run command: ${command}`);
    }

    const run = spawn('bin/run', argv, { shell: false });

    const buffer = new Array<string>();

    run.stdout.on('data', (chunk: Buffer) => {
      buffer.push(chunk.toString());
    });

    run.stderr.on('data', (chunk: Buffer) => {
      buffer.push(chunk.toString());
    });

    return await new Promise((resolve) => {
      run.on('close', () => {
        const str = buffer.join('');
        resolve(str);
      });
    });
  }
}
