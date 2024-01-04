import * as dotenv from 'dotenv';
import * as http from 'http';
import GracefulShutdown from 'http-graceful-shutdown';

import { newApp } from './app';
import { initHttpGracefulShutdown } from './gracefulShutdown';

const envParsed = dotenv.config({ debug: true }).parsed!;

let server: http.Server;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion

export const createServer = async (port: number = 9000) => {
  const configuration = {
    arcCloudToken: envParsed.ARC_CLOUD_TOKEN,
    secretKey: envParsed.SECRET_KEY,
  };
  newApp(configuration)
    .then(({ app }) => {
      // eslint-disable-next-line no-console
      console.log('Starting HTTP server on port %d', port);
      server = http.createServer(app).listen(port, () => {
        // eslint-disable-next-line no-console
        console.log('Listening on port %d', port);
      });

      server.on('close', () => {
        app.emit('server:stop');
        // eslint-disable-next-line no-console
        console.log('HTTP server close.');
      });

      const shutdownOptions: GracefulShutdown.Options = {
        signals: 'SIGINT SIGTERM',
        timeout: 30000,
        development: process.env.NODE_ENV === 'development',
        finally: () => {
          // eslint-disable-next-line no-console
          console.log('Server gracefully shutted down.....');
        },
      };
      initHttpGracefulShutdown(server, app, shutdownOptions);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('Error loading app: %s', err);
      process.exit(1);
    });
};

createServer();
