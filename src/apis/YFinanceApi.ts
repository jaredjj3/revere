import * as http from 'http';

const HOSTNAME = 'yfinance';

export class YFinanceApi {
  private async getInfo(symbol: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const req = http.request({ hostname: HOSTNAME, pathname: `/ticker/${symbol}` }, (res) => {
        let str = '';

        res.on('data', (chunk) => {
          str += chunk;
        });

        res.on('end', () => {
          const json = JSON.parse(str);
          resolve(json);
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
