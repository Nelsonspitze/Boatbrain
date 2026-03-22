// Web stub — returns empty state for preview purposes
import { create } from 'zustand';

interface BoatsState {
  boats: any[];
  activeBoatId: string | null;
  isLoading: boolean;
  loadBoats: () => Promise<void>;
  setActiveBoat: (id: string) => void;
  addBoat: (data: any) => Promise<any>;
  updateBoat: (id: string, data: any) => Promise<void>;
  deleteBoat: (id: string) => Promise<void>;
  getBoatSystems: (boatId: string) => Promise<any[]>;
  getBoatComponents: (boatId: string) => Promise<any[]>;
}

export const useBoatsStore = create<BoatsState>(() => ({
  boats: [],
  activeBoatId: null,
  isLoading: false,
  loadBoats: async () => {},
  setActiveBoat: () => {},
  addBoat: async (data) => ({ ...data, id: 'web-preview', createdAt: '', updatedAt: '', syncedAt: null }),
  updateBoat: async () => {},
  deleteBoat: async () => {},
  getBoatSystems: async () => [],
  getBoatComponents: async () => [],
}));
