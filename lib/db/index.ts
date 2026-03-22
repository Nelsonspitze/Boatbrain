import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('boatbrain.db');
export const db = drizzle(sqlite, { schema });

export async function initDatabase() {
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS boats (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      make TEXT,
      model TEXT,
      year INTEGER,
      loa REAL,
      type TEXT,
      engine_make TEXT,
      engine_model TEXT,
      hull_number TEXT,
      photo_uri TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS systems (
      id TEXT PRIMARY KEY,
      boat_id TEXT NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT,
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      system_id TEXT NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
      boat_id TEXT NOT NULL,
      name TEXT NOT NULL,
      make TEXT,
      model TEXT,
      serial_number TEXT,
      install_date TEXT,
      notes TEXT,
      manual_uri TEXT,
      photo_uri TEXT,
      is_verified INTEGER DEFAULT 0,
      ai_generated INTEGER DEFAULT 0,
      part_number TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_tasks (
      id TEXT PRIMARY KEY,
      boat_id TEXT NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
      component_id TEXT REFERENCES components(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      interval_type TEXT,
      interval_value INTEGER,
      next_due_date TEXT,
      next_due_hours INTEGER,
      is_completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'normal',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT REFERENCES maintenance_tasks(id) ON DELETE SET NULL,
      boat_id TEXT NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
      component_id TEXT REFERENCES components(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      notes TEXT,
      engine_hours_at_service INTEGER,
      parts_used TEXT,
      cost REAL,
      currency TEXT DEFAULT 'EUR',
      performed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS ai_cache (
      id TEXT PRIMARY KEY,
      cache_key TEXT NOT NULL UNIQUE,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      boat_id TEXT,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT,
      attempts INTEGER DEFAULT 0,
      last_attempt_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
}
