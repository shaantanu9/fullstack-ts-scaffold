import { startServer, startClient, stopServers } from './setup';

export const setup = async (): Promise<void> => {
  await startServer();
  await startClient();
};

export const teardown = async (): Promise<void> => {
  await stopServers();
};
