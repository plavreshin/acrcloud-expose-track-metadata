import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import { GraphQLError } from 'graphql';
import { log } from 'src/common/logger';
import { ValidationError } from 'src/types/validation';
import { Resolvers } from 'src/web/__generated__/resolvers-types';

export const trackQueryResolvers: Resolvers = {
  Query: {
    getTrackByNameAndArtist: async (_, args, context) => {
      log.info(`getTrackByNameAndArtist: name: ${args.name} artistName: ${args.artistName}`, { ...args });
      const tracksE = await context.services.trackService.getTrackMetadataOrRetrieve(args.name, args.artistName);
      return pipe(
        tracksE,
        E.fold(
          (err) => {
            throw new GraphQLError(err, {
              extensions: { code: err },
            });
          },
          (tracks) => tracks,
        ),
      );
    },
    getAllTracks: async (_, __, context) => {
      log.info(`getAllTracks:`);
      return context.services.trackService.getTracks();
    },
    getTrackById: async (_, args, context) => {
      log.info(`getTrackById: id=${args.id}`);
      const trackO = await context.services.trackService.getTrackById(args.id);
      return pipe(
        trackO,
        O.fold(
          () => {
            log.warn(`No track found for ${args.id}`);
            throw new GraphQLError(`No track found for ${args.id}`, {
              extensions: { code: ValidationError.NotFound },
            });
          },
          (track) => {
            log.info(`success getTrackById: track=${JSON.stringify(track)}`);
            return track;
          },
        ),
      );
    },
  },
};
