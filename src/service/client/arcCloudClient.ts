// import fetch from '@adobe/node-fetch-retry';
import { none, Option, some } from 'fp-ts/lib/Option';
import { log } from 'src/common/logger';
import { AppConfiguration } from 'src/types/configuration';

export type ArtisEntry = {
  name: string;
};

export type Album = {
  name: string;
  release_date: string;
};

export type TrackMetadata = {
  name: string;
  artists: ArtisEntry[];
  isrc: string;
  duration_ms: number;
  album: Album;
};

type ArcCloudTrackLookupRequest = {
  track: string;
  artists: string[];
};

type TrackMetadataResponse = {
  data: TrackMetadata[];
};

export class ArcCloudClient {
  private readonly config: AppConfiguration;

  private metadataEndpoint = 'https://eu-api-v2.acrcloud.com/api/external-metadata/tracks';

  constructor(config: AppConfiguration) {
    this.config = config;
  }

  public async getTrackMetadata(name: string, artistName: string): Promise<Option<TrackMetadata[]>> {
    try {
      const response = await this.getTrackMetadataFromArcCloud(name, artistName);

      log.info(`Arc cloud returned status ${response.status} for ${name}`);
      if (response.status === 200) {
        const json = await response.json();
        const trackMetadataResponse = json as TrackMetadataResponse;
        return trackMetadataResponse?.data?.length > 0 ? some(trackMetadataResponse.data) : none;
      }

      log.error(`Arc cloud returned status ${response.status} for ${name}`);
      return none;
    } catch (err) {
      log.error('Failed to get track metadata from 3rd party service for name' + name, err);
      return Promise.reject(err);
    }
  }

  protected async getTrackMetadataFromArcCloud(name: string, artistName: string) {
    const payload: ArcCloudTrackLookupRequest = {
      track: name,
      artists: [artistName],
    };

    const queryParams = new URLSearchParams();
    queryParams.append('format', 'json');
    queryParams.append('query', JSON.stringify(payload));

    const url = new URL(this.metadataEndpoint);
    url.search = queryParams.toString();

    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.arcCloudToken}`,
      },
      method: 'GET',
    });
  }
}
