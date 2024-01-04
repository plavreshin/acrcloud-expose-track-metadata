import { TrackService } from 'src/service/track/trackService';

export type AuthPayload = {
  email: string;
};

export interface Context {
  auth: {
    email: string;
  };
  services: {
    trackService: TrackService;
  };
}
