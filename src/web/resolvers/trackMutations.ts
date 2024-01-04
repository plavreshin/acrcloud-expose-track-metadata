import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { GraphQLError } from 'graphql';
import { log } from 'src/common/logger';
import { UpdateTrack } from 'src/domain/track';

import { Resolvers } from '../__generated__/resolvers-types';

export const trackMutationResolvers: Resolvers = {
  Mutation: {
    updateTrack: async (_, args, context) => {
      log.info(`updateTrack: ${args.id} by ${context.auth.email}`);
      const { id, name, artistName, duration, isrc, releaseDate } = args;
      const updateTrack: UpdateTrack = {
        name: name ?? undefined,
        artistName: artistName ?? undefined,
        duration: duration ?? undefined,
        isrc: isrc ?? undefined,
        releaseDate: releaseDate ?? undefined,
      };
      const trackE = await context.services.trackService.updateTrackMetadata(id, updateTrack);
      return pipe(
        trackE,
        E.fold(
          (err) => {
            log.warn(`No track found for ${args.id}`, err);
            throw new GraphQLError(err, {
              extensions: { code: err },
            });
          },
          (track) => track,
        ),
      );
    },
    deleteTrack: async (_, args, context) => {
      log.info(`deleteTrack: ${args.id} by ${context.auth.email}`);
      return context.services.trackService.deleteTrack(args.id);
    },
  },
};
