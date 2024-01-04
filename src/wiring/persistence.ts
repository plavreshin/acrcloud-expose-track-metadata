import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

import { AppConfiguration } from '../types/configuration';

export const getDbClient = async (_: AppConfiguration) => {
  const db = await open<sqlite3.Database, sqlite3.Statement>({
    filename: ':memory',
    driver: sqlite3.Database,
  });

  await db.migrate({
    migrationsPath: path.join(path.resolve(), './migrations'),
  });

  return db;
};
