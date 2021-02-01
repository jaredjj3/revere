import * as https from 'https';
import { parse } from 'node-html-parser';
import { MessageType, SquozeMessage } from '../messages';
import { Detector } from './types';

const HOSTNAME = 'isthesqueezesquoze.com';
const VERSION = 0;

type Metadata = {
  version: number;
  h1: string;
};

export class SquozeDetector implements Detector {
  async detect(): Promise<SquozeMessage[]> {
    const [prev, next] = await Promise.all([this.getPrevData(), this.getNextData()]);
    const message = this.getMessage(prev, next);
    if (message) {
      return [message];
    } else {
      return [];
    }
  }

  private getMessage(prev: Metadata, next: Metadata): SquozeMessage | null {
    if (!prev && !next) {
      return null;
    }
    if (prev.h1 !== next.h1) {
      return {
        type: MessageType.Squoze,
        detectedAt: new Date(),
        content: `squoze has a new headline:\n\n'${next.h1}'`,
      };
    }
    return null;
  }

  private async getPrevData(): Promise<Metadata> {
    return { version: VERSION, h1: '' };
  }

  private async getNextData(): Promise<Metadata> {
    const rawHomepage = await this.getRawHomepage();
    const h1 = this.getH1(rawHomepage);
    return { version: VERSION, h1 };
  }

  private getH1(rawHomepage: string): string {
    const root = parse(rawHomepage);
    const h1 = root.querySelector('h1');
    return h1.innerText.toLowerCase();
  }

  private getRawHomepage(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      https
        .request({ hostname: HOSTNAME }, (res) => {
          let str = '';

          res.on('data', (chunk) => {
            str += chunk;
          });

          res.on('end', () => {
            resolve(str);
          });

          res.on('error', (err) => {
            reject(err);
          });
        })
        .end();
    });
  }
}
