import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { Either } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { Option } from 'fp-ts/lib/Option';
import * as O from 'fp-ts/lib/Option';
import { log } from 'src/common/logger';
import { TrackRepository } from 'src/db/trackRepository';
import { CreateTrack, Track, UpdateTrack } from 'src/domain/track';
import { ValidationError } from 'src/types/validation';

import { ArcCloudClient, TrackMetadata } from '../client/arcCloudClient';

export class TrackService {
  private readonly trackRepository: TrackRepository;
  private readonly arcCloudClient: ArcCloudClient;

  constructor(trackRepository: TrackRepository, arcCloudClient: ArcCloudClient) {
    this.trackRepository = trackRepository;
    this.arcCloudClient = arcCloudClient;
  }

  public async getTracks(): Promise<Track[]> {
    return this.trackRepository.getTracks();
  }

  public async getTrackById(id: number): Promise<Option<Track>> {
    return this.trackRepository.getTrackById(id);
  }

  public async getTrackMetadataOrRetrieve(
    name: string,
    artistName: string,
  ): Promise<E.Either<ValidationError, Track[]>> {
    const knownTracks = await this.trackRepository.getTrackByNameAndArtist(name, artistName);

    if (knownTracks.length === 0) {
      log.info(`Track with name ${name} not found in DB, retrieving from 3rd party service`);
      const tracksMetadata: Either<ValidationError, TrackMetadata[]> = await this.arcCloudClient
        .getTrackMetadata(name, artistName)
        .then((tracks) => {
          return E.fromOption(() => ValidationError.NotFound)(tracks);
        })
        .catch((err) => {
          log.error(`No tracks match ${name} due to afailure in ArcCloud request`, err);
          return E.left(ValidationError.ExternalApiError);
        });

      const createTracksE = pipe(
        tracksMetadata,
        E.map((tracksMetadata) => {
          log.info(`Found ${JSON.stringify(tracksMetadata)} tracks for name ${name}`);
          const createTracks = tracksMetadata.reduce((acc, item) => {
            for (const artist of item.artists) {
              if (artist.name === artistName) {
                acc.push({
                  name: item.name,
                  artistName: artist.name,
                  duration: item.duration_ms,
                  isrc: item.isrc,
                  releaseDate: String(item.album.release_date),
                });
              }
            }
            return acc;
          }, [] as CreateTrack[]);
          return createTracks;
        }),
      );

      return pipe(
        createTracksE,
        E.fold(
          async (err) => {
            return Promise.resolve(E.left(err));
          },
          async (createTracks) => {
            log.info(`Found ${createTracks.length} tracks for name ${name}, persisting to DB`);
            const promises = createTracks.map((track) => this.trackRepository.persistTrack(track));
            const idsOpt = await Promise.all(promises);
            const ids = pipe(idsOpt, A.compact);
            const tracks = await this.trackRepository.getTrackByIds(ids);
            return Promise.resolve(E.right(tracks));
          },
        ),
      );
    }

    return Promise.resolve(E.right(knownTracks));
  }

  public async updateTrackMetadata(id: number, update: UpdateTrack): Promise<E.Either<ValidationError, Track>> {
    const track = await this.trackRepository.getTrackById(id);

    return pipe(
      track,
      O.fold(
        async () => {
          return Promise.resolve(E.left(ValidationError.NotFound));
        },
        async (track) => {
          const updatedTrack: Track = {
            ...track,
            name: update.name ?? track.name,
            artistName: update.artistName ?? track.artistName,
            isrc: update.isrc ?? track.isrc,
            duration: update.duration ?? track.duration,
            releaseDate: update.releaseDate ?? track.releaseDate,
            updatedAt: new Date(),
          };

          const updatedO = await this.trackRepository.updateTrack(id, updatedTrack);
          return E.fromOption(() => ValidationError.NotFound)(updatedO);
        },
      ),
    );
  }

  public async deleteTrack(id: number): Promise<boolean> {
    return this.trackRepository.deleteTrack(id);
  }
}
