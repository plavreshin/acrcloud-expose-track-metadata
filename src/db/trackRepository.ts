import * as O from 'fp-ts/lib/Option';
import { Option } from 'fp-ts/lib/Option';
import { Database } from 'sqlite';
import { CreateTrack, Track } from 'src/domain/track';

export type TrackModel = {
  id: number;
  name: string;
  artistName: string;
  duration: number;
  isrc: string;
  releaseDate: string;
  createdAt: Date;
  updatedAt?: Date;
};

export class TrackRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getTracks(): Promise<Track[]> {
    return this.db.all<TrackModel[]>('SELECT * FROM track');
  }

  public async getTrackByNameAndArtist(name: string, artistName: string): Promise<Track[]> {
    return this.db.all<TrackModel[]>(
      'SELECT * FROM track WHERE name like ? and artistName like ?',
      `%${name}%`,
      `%${artistName}%`,
    );
  }

  public async persistTrack(track: CreateTrack): Promise<Option<number>> {
    const now = new Date();
    const result = await this.db.run(
      `INSERT INTO track (name, artistName, duration, isrc, releaseDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        track.name,
        track.artistName,
        track.duration,
        track.isrc,
        track.releaseDate,
        now.toISOString(),
        now.toISOString(),
      ],
    );
    return O.fromNullable(result.lastID);
  }

  public async updateTrack(id: number, track: Track): Promise<Option<Track>> {
    const now = new Date();
    const result = await this.db.run(
      `UPDATE track SET name = ?, artistName = ?, duration = ?, isrc = ?, releaseDate = ?, updatedAt = ? WHERE id = ?`,
      [track.name, track.artistName, track.duration, track.isrc, track.releaseDate, now.toISOString(), id],
    );
    return result.changes && result.changes > 0 ? O.some(track) : O.none;
  }

  public async getTrackById(id: number): Promise<Option<Track>> {
    const row = await this.db.get<TrackModel>('SELECT * FROM track WHERE id = ?', id);
    return O.fromNullable(row);
  }

  public async getTrackByIds(ids: number[]): Promise<Track[]> {
    return this.db.all<TrackModel[]>(`SELECT * FROM track WHERE id IN (${ids.map((_) => '?').join(',')})`, ids);
  }

  public async deleteTrack(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM track WHERE id = ?', id);
    return result.changes ? result.changes > 0 : false;
  }
}
