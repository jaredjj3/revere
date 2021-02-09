import { logger } from './logger';

type ExitCallback = () => Promise<void>;

const catchAll = (callback: ExitCallback) => async () => {
  try {
    await callback();
  } catch (err) {
    logger.error('error caught while cleaning up', err);
  }
};

/**
 * IFFE that "globally" tracks callbacks without polluting the global namespace.
 * Each invocation of onCleanup returns an cleanup callback that can be manually called
 * to cleanup resources.
 */
export const onCleanup = (() => {
  const callbacks = new Array<ExitCallback>();

  const cleanup = async () => {
    await Promise.all(callbacks.map((callback) => catchAll(callback)));
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  return (callback: ExitCallback): ExitCallback => {
    callbacks.push(callback);
    return cleanup;
  };
})();
