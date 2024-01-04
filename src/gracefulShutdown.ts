import { Express } from 'express';
import * as http from 'http';
import httpGracefulShutdown from 'http-graceful-shutdown';
import * as https from 'https';

export const initHttpGracefulShutdown = (
  server: http.Server | https.Server,
  app: Express,
  options: httpGracefulShutdown.Options,
): void => {
  httpGracefulShutdown(server, {
    ...options,
    finally: () => {
      if (options.finally) {
        options.finally();
      }
      app.emit('server:stop');
    },
  });
};
