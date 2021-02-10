import { Cmp } from '@prisma/client';
import { RevereError } from '../errors';

export const ALLOWED_SYMBOLS = ['<', '<=', '==', '>=', '>'];

export const toCmpWord = (str: string): Cmp => {
  switch (str) {
    case '<':
      return Cmp.LT;
    case '<=':
      return Cmp.LTEQ;
    case '==':
      return Cmp.EQ;
    case '>=':
      return Cmp.GTEQ;
    case '>':
      return Cmp.GT;
    default:
      throw new RevereError(`invalid symbol '${str}', must be one of: ${ALLOWED_SYMBOLS.join(', ')}`);
  }
};
