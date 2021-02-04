import { PrismaClient, SquozeResponse } from '@prisma/client';
import * as https from 'https';
import { injectable } from 'inversify';
import { parse } from 'node-html-parser';
import { MessageType, Severity, SquozeMessage } from '../messages';
import { Detector } from './types';

const SQUOZE_HOSTNAME = 'isthesqueezesquoze.com';

@injectable()
export class SquozeDetector implements Detector<SquozeMessage> {
  private prisma = new PrismaClient();

  async detect(): Promise<SquozeMessage[]> {
    const [prev, next] = await Promise.all([this.getPrevData(), this.getNextData()]);
    const messages = this.getMessages(prev, next);
    return messages;
  }

  private getMessages(prev: SquozeResponse | null, next: SquozeResponse): SquozeMessage[] {
    const timestamp = new Date();
    const type = MessageType.Squoze;
    const messages = new Array<SquozeMessage>();

    if (!prev) {
      messages.push({
        type,
        timestamp,
        severity: Severity.Info,
        content: `squoze data primed`,
      });
    }

    if (prev && prev.httpStatusCode !== next.httpStatusCode) {
      messages.push({
        type,
        timestamp,
        severity: Severity.Info,
        content: `squoze changed http status codes: '${prev.httpStatusCode}' -> '${next.httpStatusCode}'`,
      });
    }

    if (prev && prev.header !== next.header) {
      messages.push({
        type,
        timestamp,
        severity: Severity.Warning,
        content: `squoze has a new headline:\n\n'${next.header}'`,
      });
    }

    return messages;
  }

  private async getPrevData(): Promise<SquozeResponse | null> {
    return await this.prisma.squozeResponse.findFirst({ orderBy: { createdAt: 'desc' } });
  }

  private async getNextData(): Promise<SquozeResponse> {
    const [rawHomepage, httpStatusCode] = await this.getRawHomepage();
    const root = parse(rawHomepage);
    const header = root.querySelector('h1').innerText.toLowerCase();
    return await this.prisma.squozeResponse.create({
      data: { httpStatusCode, header },
    });
  }

  private getRawHomepage(): Promise<[string, number]> {
    return new Promise<[string, number]>((resolve, reject) => {
      https
        .request({ hostname: SQUOZE_HOSTNAME }, (res) => {
          let str = '';

          res.on('data', (chunk) => {
            str += chunk;
          });

          res.on('end', () => {
            const httpStatusCode = res.statusCode || -1;
            resolve([str, httpStatusCode]);
          });

          res.on('error', (err) => {
            reject(err);
          });
        })
        .end();
    });
  }
}
