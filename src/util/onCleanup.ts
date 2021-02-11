import { logger } from './logger';

type CleanupCallback = () => Promise<void>;

const catchAll = async (callback: CleanupCallback): Promise<void> => {
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
  const callbacks = new Array<CleanupCallback>();

  const cleanup = async () => {
    logger.info('cleanup started');
    await Promise.all(callbacks.map((callback) => catchAll(callback)));
    logger.info('cleanup done');
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  return (callback?: CleanupCallback): CleanupCallback => {
    if (callback) {
      callbacks.push(callback);
    }
    return cleanup;
  };
})();
