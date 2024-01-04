import 'dotenv/config';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import express, { Express } from 'express';
import { readFileSync } from 'fs';
import { GraphQLError } from 'graphql';
import { resolvers as scalarResolvers, typeDefs as scalarTypeDefs } from 'graphql-scalars';
import http from 'http';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import path from 'path';

import { log } from './common/logger';
import { AppConfiguration } from './types/configuration';
import { AuthPayload, Context } from './types/context';
import { mutations } from './web/resolvers/mutations';
import { trackMutationResolvers } from './web/resolvers/trackMutations';
import { trackQueryResolvers } from './web/resolvers/trackQueries';
import { getDbClient } from './wiring/persistence';
import Routes from './wiring/routes';
import { getTrackService } from './wiring/services';

export type AppAndResources = {
  app: Express;
};

export const newApp = async (config: AppConfiguration): Promise<AppAndResources> => {
  const app = express();
  const httpServer = http.createServer(app);

  const db = await getDbClient(config);
  const trackService = getTrackService(config, db);

  const typeDefs = readFileSync(path.join(path.resolve(), './src/web/schema.graphql'), 'utf-8');

  const apolloServer = new ApolloServer<Context>({
    typeDefs: [...scalarTypeDefs, typeDefs],
    resolvers: [scalarResolvers, mutations, trackQueryResolvers, trackMutationResolvers],
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await apolloServer.start();

  const routes = new Routes(config);

  app.use(express.json());

  routes.registerPublicRoutes(app);

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    morgan('dev'),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        try {
          const authPayload = jwt.verify(token, config.secretKey) as AuthPayload;
          return {
            auth: {
              email: authPayload.email,
            },
            services: {
              trackService,
            },
          };
        } catch (err) {
          log.error(`Error verifying token: ${err}`);
          throw new GraphQLError('You are not authorized to perform this action.', {
            extensions: {
              code: 'FORBIDDEN',
            },
          });
        }
      },
    }),
  );

  return Promise.resolve({ app });
};

export const defaultModule = { newApp };
