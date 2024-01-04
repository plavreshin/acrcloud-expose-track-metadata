import { Database } from 'sqlite';
import { TrackRepository } from 'src/db/trackRepository';
import { ArcCloudClient } from 'src/service/client/arcCloudClient';
import { TrackService } from 'src/service/track/trackService';
import { AppConfiguration } from 'src/types/configuration';

export const getTrackService = (config: AppConfiguration, db: Database): TrackService => {
  const arcCloudClient = new ArcCloudClient(config);
  const trackRepository = new TrackRepository(db);
  return new TrackService(trackRepository, arcCloudClient);
};
