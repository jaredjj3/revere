import { Command, flags } from '@oclif/command';
import { PrismaClient } from '@prisma/client';

export default class Listscheds extends Command {
  static description = 'list the schedules from the db';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  prisma = new PrismaClient();

  async run(): Promise<void> {
    this.parse(Listscheds);
    const schedules = await this.prisma.schedule.findMany();
    this.log(JSON.stringify(schedules, null, 2));
    this.exit(0);
  }
}
