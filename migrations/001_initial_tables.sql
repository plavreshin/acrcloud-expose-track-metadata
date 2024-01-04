CREATE TABLE
    track (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        artistName TEXT NOT NULL,
        duration INTEGER NOT NULL,
        isrc TEXT NOT NULL,
        releaseDate TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
    );
