import * as SQLite from 'expo-sqlite';

/**
 * SQLite instance tracking locally saved sightings while offline.
 */
// The new drizzle-compatible Expo SQLite API uses openDatabaseSync
export const db = SQLite.openDatabaseSync('hilal_offline.db');

export interface OfflineSighting {
    id?: number;
    latitude: number;
    longitude: number;
    observedAt: string;
    result: "naked_eye" | "optical_aid" | "not_seen";
    notes: string | null;
    syncStatus: "pending" | "synced";
}

// Initialize the database schema for local sightings.
export function initDB() {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS sightings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      observedAt TEXT NOT NULL,
      result TEXT NOT NULL,
      notes TEXT,
      syncStatus TEXT DEFAULT 'pending'
    );
  `);
}

export function insertOfflineSighting(sighting: Omit<OfflineSighting, "id" | "syncStatus">) {
    const statement = db.prepareSync(
        'INSERT INTO sightings (latitude, longitude, observedAt, result, notes, syncStatus) VALUES ($lat, $lng, $obsAt, $res, $notes, $sync)'
    );
    try {
        const result = statement.executeSync({
            $lat: sighting.latitude,
            $lng: sighting.longitude,
            $obsAt: sighting.observedAt,
            $res: sighting.result,
            $notes: sighting.notes,
            $sync: "pending"
        });
        return result.lastInsertRowId;
    } finally {
        statement.finalizeSync();
    }
}

export function getPendingSightings(): OfflineSighting[] {
    return db.getAllSync<OfflineSighting>(
        'SELECT * FROM sightings WHERE syncStatus = "pending"'
    );
}

export function markSightingSynced(id: number) {
    const statement = db.prepareSync('UPDATE sightings SET syncStatus = "synced" WHERE id = $id');
    try {
        statement.executeSync({ $id: id });
    } finally {
        statement.finalizeSync();
    }
}
