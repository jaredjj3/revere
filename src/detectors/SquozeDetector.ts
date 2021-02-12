import { PrismaClient, SquozeResponse } from '@prisma/client';
import * as https from 'https';
import { inject, injectable } from 'inversify';
import parse from 'node-html-parser';
import { $messages } from '../helpers';
import { TYPES } from '../inversify.constants';
import { Message } from '../messages';
import { logger } from '../util';

const SQUOZE_HOSTNAME = 'isthesqueezesquoze.com';

@injectable()
export class SquozeDetector {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async detect(): Promise<Message[]> {
    const [prev, next] = await Promise.all([this.getPrevData(), this.getNextData()]);
    return this.getMessages(prev, next);
  }

  private getMessages(prev: SquozeResponse | null, next: SquozeResponse): Message[] {
    const messages = new Array<Message>();

    if (!prev) {
      messages.push($messages.stdout(`squoze data primed`));
    }

    if (prev && prev.httpStatusCode !== next.httpStatusCode) {
      messages.push(
        $messages.stdout(`squoze changed http status codes: '${prev.httpStatusCode}' -> '${next.httpStatusCode}'`)
      );
    }

    if (
      prev &&
      prev.httpStatusCode === 200 &&
      next.httpStatusCode === 200 &&
      prev.header !== next.header &&
      next.header
    ) {
      messages.push($messages.squoze(next.header));
    }

    return messages;
  }

  private async getPrevData(): Promise<SquozeResponse | null> {
    return await this.prisma.squozeResponse.findFirst({ orderBy: { createdAt: 'desc' } });
  }

  private async getNextData(): Promise<SquozeResponse> {
    try {
      const [rawHomepage, httpStatusCode] = await this.getRawHomepage();
      const root = parse(rawHomepage);
      const header = root.querySelector('h1').innerText.toLowerCase();
      return await this.prisma.squozeResponse.create({
        data: { httpStatusCode, header },
      });
    } catch (err) {
      logger.warn('http request failed');
      return await this.prisma.squozeResponse.create({
        data: { httpStatusCode: -1, errorMessage: err.message },
      });
    }
  }

  private getRawHomepage(): Promise<[string, number]> {
    return new Promise<[string, number]>((resolve, reject) => {
      const req = https.request({ hostname: SQUOZE_HOSTNAME }, (res) => {
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
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }
}
