import { test, expect } from '@playwright/test';
import { Track } from 'src/domain/track';

test('get tracks by for Calvin Harris', async ({ request }) => {
  const response = await request.post('http://localhost:9000/graphql', {
    headers: {
      Authorization:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsIiwiaWF0IjoxNzA0MzE5Mzc4LCJleHAiOjE3MDQ5MjQxNzh9.dRysG06R1NIWMiF90hn6Twlid-wmV1zIQdLGDeFUlTE',
    },
    data: {
      query: `
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
    `,
    },
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  const tracks = data?.getTrackByNameAndArtist as Track[];
  console.log(tracks);
  expect(new Set(tracks.map((item) => item.artistName))).toEqual(new Set(['Calvin Harris']));
});
