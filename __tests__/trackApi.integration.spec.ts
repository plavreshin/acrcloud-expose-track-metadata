import { ApolloServer } from '@apollo/server';
import { readFileSync } from 'fs';
import path from 'path';
import { Database } from 'sqlite';
import { resolvers as scalarResolvers, typeDefs as scalarTypeDefs } from 'graphql-scalars';
import { AppConfiguration } from 'src/types/configuration';
import { TrackRepository } from 'src/db/trackRepository';
import { ArcCloudClient } from 'src/service/client/arcCloudClient';
import { TrackService } from 'src/service/track/trackService';
import { Context } from 'src/types/context';
import { trackQueryResolvers } from 'src/web/resolvers/trackQueries';
import { Track } from 'src/domain/track';
import { trackMutationResolvers } from 'src/web/resolvers/trackMutations';
import { none, some } from 'fp-ts/lib/Option';
import { right } from 'fp-ts/lib/Either';

const getAllTracksQuery = `
query TrackQuery {
  getAllTracks {
    id
    name
    artistName
  }
}
`;

const getSingleTrackQuery = `
query TrackQuery {
  getTrackById(id: 1) {
      id
      name
      artistName
    }  
  }
`;

const getTrackByNameAndArtistQuery = `
query TrackQuery {
  getTrackByNameAndArtist(name: "Summer", artistName: "Calvin Harris") {
    id
    createdAt
    updatedAt
    name
    artistName
    duration
    isrc
    releaseDate
  }
}
`;

const deleteTrackMutation = `
mutation TrackMutation {
  deleteTrack(id: 1)
  }
`;

const updateTrackMutation = `
mutation UpdateTrack {
  updateTrack(id: 1, name: "Updated") {
    name
  }
}
`;

const tracks: Track[] = [
  {
    id: 1,
    name: 'name',
    artistName: 'artistName',
    duration: 1,
    isrc: 'isrc',
    releaseDate: '2024-01-01',
    createdAt: new Date(),
  },
];

describe('trackApi', () => {
  const config: AppConfiguration = {
    arcCloudToken: 'token',
    secretKey: 'track-api',
  };

  const trackRepositoryMock: TrackRepository = new TrackRepository({} as Database);
  const arcCloudClientMock: ArcCloudClient = new ArcCloudClient(config);
  const trackService: TrackService = new TrackService(trackRepositoryMock, arcCloudClientMock);

  const contextValue = {
    auth: {
      email: 'email@email.me',
    },
    services: {
      trackService,
    },
  };

  const makeServer = () => {
    const typeDefs = readFileSync(path.join(path.resolve(), './src/web/schema.graphql'), 'utf-8');

    const server = new ApolloServer<Context>({
      typeDefs: [...scalarTypeDefs, typeDefs],
      resolvers: [scalarResolvers, trackQueryResolvers, trackMutationResolvers],
    });

    return server;
  };

  it('should return existing all tracks successfully', async () => {
    trackService.getTracks = jest.fn().mockResolvedValue(Promise.resolve(tracks));

    const res = await makeServer().executeOperation(
      {
        query: getAllTracksQuery,
      },
      {
        contextValue: {
          auth: {
            email: 'email@email.me',
          },
          services: {
            trackService,
          },
        },
      },
    );

    expect(res).toMatchSnapshot();
  });

  it('should return single track successfully', async () => {
    trackService.getTrackById = jest.fn().mockResolvedValue(some(tracks[0]));

    const res = await makeServer().executeOperation(
      {
        query: getSingleTrackQuery,
        variables: {
          id: 1,
        },
      },
      {
        contextValue,
      },
    );

    expect(res).toMatchSnapshot();
  });

  it('should return track by name and artist successfully', async () => {
    trackService.getTrackMetadataOrRetrieve = jest.fn().mockResolvedValue(right(tracks));

    const res = await makeServer().executeOperation(
      {
        query: getTrackByNameAndArtistQuery,
        variables: {
          name: 'Summer',
          artistName: 'Calvin Harris',
        },
      },
      {
        contextValue,
      },
    );

    expect(res).toMatchSnapshot();
  });

  it('should delete track', async () => {
    trackService.deleteTrack = jest.fn().mockResolvedValue(true);

    const res = await makeServer().executeOperation(
      {
        query: deleteTrackMutation,
      },
      {
        contextValue: contextValue,
      },
    );

    expect(res).toMatchSnapshot();
  });

  it('should get validation error when track is not found', async () => {
    trackService.getTrackById = jest.fn().mockResolvedValue(none);

    const res = await makeServer().executeOperation(
      {
        query: getSingleTrackQuery,
      },
      {
        contextValue: contextValue,
      },
    );

    expect(res).toMatchSnapshot();
  });

  it('should update track name', async () => {
    trackService.updateTrackMetadata = jest.fn().mockResolvedValue(right(tracks[0]));

    const res = await makeServer().executeOperation(
      {
        query: updateTrackMutation,
      },
      {
        contextValue: contextValue,
      },
    );

    expect(res).toMatchSnapshot();
  });
});
