type ExitCallback = () => void;

export const onExit = (callback: ExitCallback): void => {
  process.on('SIGTERM', callback);
  process.on('SIGINT', callback);
};
