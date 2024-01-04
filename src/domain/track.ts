export type Track = {
  id: number;
  name: string;
  artistName: string;
  duration: number;
  isrc: string;
  releaseDate: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type CreateTrack = {
  name: string;
  artistName: string;
  duration: number;
  isrc: string;
  releaseDate: string;
};

export type UpdateTrack = {
  name?: string;
  artistName?: string;
  duration?: number;
  isrc?: string;
  releaseDate?: string;
};
