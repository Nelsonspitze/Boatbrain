import { create } from 'zustand';
import { db } from '../db';
import { boats, components, systems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

type Boat = typeof boats.$inferSelect;
type System = typeof systems.$inferSelect;
type Component = typeof components.$inferSelect;

interface BoatsState {
  boats: Boat[];
  activeBoatId: string | null;
  isLoading: boolean;

  loadBoats: () => Promise<void>;
  setActiveBoat: (id: string) => void;
  addBoat: (data: Omit<Boat, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt'>) => Promise<Boat>;
  updateBoat: (id: string, data: Partial<Boat>) => Promise<void>;
  deleteBoat: (id: string) => Promise<void>;

  getBoatSystems: (boatId: string) => Promise<System[]>;
  getBoatComponents: (boatId: string) => Promise<Component[]>;
}

const now = () => new Date().toISOString();

export const useBoatsStore = create<BoatsState>((set, get) => ({
  boats: [],
  activeBoatId: null,
  isLoading: false,

  loadBoats: async () => {
    if (!db) return;
    set({ isLoading: true });
    const rows = await db.select().from(boats);
    set({ boats: rows, isLoading: false });
  },

  setActiveBoat: (id) => set({ activeBoatId: id }),

  addBoat: async (data) => {
    const boat: Boat = {
      ...data,
      id: randomUUID(),
      createdAt: now(),
      updatedAt: now(),
      syncedAt: null,
    };
    if (db) await db.insert(boats).values(boat);
    set((s) => ({ boats: [...s.boats, boat] }));
    return boat;
  },

  updateBoat: async (id, data) => {
    if (db) await db.update(boats).set({ ...data, updatedAt: now() }).where(eq(boats.id, id));
    set((s) => ({
      boats: s.boats.map((b) => (b.id === id ? { ...b, ...data, updatedAt: now() } : b)),
    }));
  },

  deleteBoat: async (id) => {
    if (db) await db.delete(boats).where(eq(boats.id, id));
    set((s) => ({ boats: s.boats.filter((b) => b.id !== id) }));
  },

  getBoatSystems: async (boatId) => {
    if (!db) return [];
    return db.select().from(systems).where(eq(systems.boatId, boatId));
  },

  getBoatComponents: async (boatId) => {
    if (!db) return [];
    return db.select().from(components).where(eq(components.boatId, boatId));
  },
}));
