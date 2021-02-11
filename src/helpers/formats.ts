import * as numeral from 'numeral';
import { YFinanceApiInfoResponseKeys } from '../apis';

export const yfinanceInfoField = (field: YFinanceApiInfoResponseKeys, value: unknown): string => {
  switch (field) {
    case 'bid':
    case 'ask':
      return numeral(value).format('$0,0.00');
    case 'averageVolume':
      return numeral(value).format('0,0');
    case 'marketCap':
      return numeral(value).format('($ 0.00 a)').toUpperCase();
    case 'shortRatio':
      return numeral(value).format('0.00');
    default:
      return `${value}`;
  }
};
