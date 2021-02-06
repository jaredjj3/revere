import { Prisma, PrismaClient, Schedule } from '@prisma/client';
import { ScheduledTask } from 'node-cron';
import { NotImplementedError } from '../errors';

export class ScheduleService {
  prisma = new PrismaClient();

  async runAllAndWatch(): Promise<void> {
    throw new NotImplementedError();
  }

  async schedule(): Promise<ScheduledTask> {
    throw new NotImplementedError();
  }

  async unschedule(): Promise<ScheduledTask> {
    throw new NotImplementedError();
  }

  async findAll(): Promise<Schedule[]> {
    return await this.prisma.schedule.findMany();
  }

  async findById(id: number): Promise<Schedule | null> {
    return await this.prisma.schedule.findFirst({ where: { id } });
  }

  async findByName(name: string): Promise<Schedule | null> {
    return await this.prisma.schedule.findFirst({ where: { name } });
  }

  async findActive(): Promise<Schedule[]> {
    return await this.prisma.schedule.findMany({ where: { active: true } });
  }

  async findInactive(): Promise<Schedule[]> {
    return await this.prisma.schedule.findMany({ where: { active: false } });
  }

  async create(args: Prisma.ScheduleCreateArgs): Promise<Schedule> {
    return await this.prisma.schedule.create(args);
  }

  async activate(id: number): Promise<Schedule> {
    return await this.prisma.schedule.update({ where: { id }, data: { active: true } });
  }

  async deactivate(id: number): Promise<Schedule> {
    return await this.prisma.schedule.update({ where: { id }, data: { active: false } });
  }
}
