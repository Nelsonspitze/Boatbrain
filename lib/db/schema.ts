import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── Boats ──────────────────────────────────────────────────────────────────

export const boats = sqliteTable('boats', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  make: text('make'),
  model: text('model'),
  year: int('year'),
  loa: real('loa'),           // Length overall in meters
  type: text('type'),         // sloop, ketch, catamaran, etc.
  engineMake: text('engine_make'),
  engineModel: text('engine_model'),
  hullNumber: text('hull_number'),
  photoUri: text('photo_uri'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  syncedAt: text('synced_at'),
});

// ─── Systems ────────────────────────────────────────────────────────────────

export const systems = sqliteTable('systems', {
  id: text('id').primaryKey(),
  boatId: text('boat_id').notNull().references(() => boats.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),           // e.g. "Electrics", "Navigation"
  category: text('category').notNull(),   // electrics | plumbing | navigation | engine | sails | safety | communication | other
  icon: text('icon'),
  notes: text('notes'),
  sortOrder: int('sort_order').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  syncedAt: text('synced_at'),
});

// ─── Components ─────────────────────────────────────────────────────────────

export const components = sqliteTable('components', {
  id: text('id').primaryKey(),
  systemId: text('system_id').notNull().references(() => systems.id, { onDelete: 'cascade' }),
  boatId: text('boat_id').notNull(),
  name: text('name').notNull(),           // e.g. "Garmin GPSmap 942"
  make: text('make'),
  model: text('model'),
  serialNumber: text('serial_number'),
  installDate: text('install_date'),
  notes: text('notes'),
  manualUri: text('manual_uri'),          // local path to PDF
  photoUri: text('photo_uri'),
  isVerified: int('is_verified', { mode: 'boolean' }).default(false),  // false = AI pre-filled, needs user confirmation
  aiGenerated: int('ai_generated', { mode: 'boolean' }).default(false),
  partNumber: text('part_number'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  syncedAt: text('synced_at'),
});

// ─── Maintenance Tasks ───────────────────────────────────────────────────────

export const maintenanceTasks = sqliteTable('maintenance_tasks', {
  id: text('id').primaryKey(),
  boatId: text('boat_id').notNull().references(() => boats.id, { onDelete: 'cascade' }),
  componentId: text('component_id').references(() => components.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  intervalType: text('interval_type'),    // calendar | engine_hours | miles
  intervalValue: int('interval_value'),
  nextDueDate: text('next_due_date'),
  nextDueHours: int('next_due_hours'),
  isCompleted: int('is_completed', { mode: 'boolean' }).default(false),
  priority: text('priority').default('normal'), // low | normal | high
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  syncedAt: text('synced_at'),
});

// ─── Maintenance Logs ────────────────────────────────────────────────────────

export const maintenanceLogs = sqliteTable('maintenance_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => maintenanceTasks.id, { onDelete: 'set null' }),
  boatId: text('boat_id').notNull().references(() => boats.id, { onDelete: 'cascade' }),
  componentId: text('component_id').references(() => components.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  notes: text('notes'),
  engineHoursAtService: int('engine_hours_at_service'),
  partsUsed: text('parts_used'),          // JSON string
  cost: real('cost'),
  currency: text('currency').default('EUR'),
  performedAt: text('performed_at').notNull(),
  createdAt: text('created_at').notNull(),
  syncedAt: text('synced_at'),
});

// ─── AI Cache ────────────────────────────────────────────────────────────────

export const aiCache = sqliteTable('ai_cache', {
  id: text('id').primaryKey(),
  cacheKey: text('cache_key').notNull().unique(), // hash of prompt + context
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),           // JSON string
  boatId: text('boat_id'),
  type: text('type').notNull(),                   // troubleshoot | maintain | populate | parts
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'),
});

// ─── Sync Queue ──────────────────────────────────────────────────────────────

export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  operation: text('operation').notNull(),   // insert | update | delete
  payload: text('payload'),                 // JSON string
  attempts: int('attempts').default(0),
  lastAttemptAt: text('last_attempt_at'),
  createdAt: text('created_at').notNull(),
});
