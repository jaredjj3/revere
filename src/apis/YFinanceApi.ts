import * as http from 'http';
import { injectable } from 'inversify';
import { YFinanceApiInfoResponse } from './types';

const HOSTNAME = 'yfinance';
const PORT = '5000';

@injectable()
export class YFinanceApi {
  async getInfo(symbol: string): Promise<YFinanceApiInfoResponse> {
    return new Promise<YFinanceApiInfoResponse>((resolve, reject) => {
      const req = http.request(`http://${HOSTNAME}:${PORT}/ticker/${symbol}`, (res) => {
        let str = '';

        res.on('data', (chunk) => {
          str += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(str);
            resolve(json);
          } catch (err) {
            reject(err);
          }
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
