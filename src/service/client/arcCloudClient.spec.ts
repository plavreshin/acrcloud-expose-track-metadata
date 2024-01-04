import * as O from 'fp-ts/Option';

import { ArcCloudClient } from './arcCloudClient';

jest.mock('@adobe/node-fetch-retry');

describe('ArcCloudClient', () => {
  const mockConfig = {
    arcCloudToken: 'mockToken',
    secretKey: 'track-api',
  };

  it('should retrieve track metadata when valid input parameters are provided', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getTrackMetadataFromArcCloudSpy = jest.spyOn(ArcCloudClient.prototype as any, 'getTrackMetadataFromArcCloud');
    getTrackMetadataFromArcCloudSpy.mockImplementation((_, __) => {
      return Promise.resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            data: [
              {
                name: 'track',
                artists: [
                  {
                    name: 'artist',
                  },
                ],
              },
            ],
          }),
      });
    });

    const client = new ArcCloudClient(mockConfig);
    const result = await client.getTrackMetadata('track', 'artist');

    const expected = O.some([
      {
        name: 'track',
        artists: [
          {
            name: 'artist',
          },
        ],
      },
    ]);
    expect(result).toEqual(expected);
    expect(getTrackMetadataFromArcCloudSpy).toHaveBeenCalledWith('track', 'artist');
  });
});
