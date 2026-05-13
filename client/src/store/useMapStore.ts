import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MapStore {
  currentRegionId: string;
  currentNodeId: string;
  discoveredNodeIds: string[];
  clearedNodeIds: string[];
  discoveredShrineNodeIds: string[];
  idleFarmNodeId: string | null;
  isIdleFarming: boolean;

  setCurrentNode: (regionId: string, nodeId: string) => void;
  discoverNode: (nodeId: string) => void;
  clearNode: (nodeId: string) => void;
  discoverShrine: (nodeId: string) => void;
  travelToShrine: (nodeId: string) => void;
  startIdleFarm: (nodeId: string) => void;
  stopIdleFarm: () => void;
  isNodeDiscovered: (nodeId: string) => boolean;
  isNodeCleared: (nodeId: string) => boolean;
}

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      currentRegionId: "region_edo_streets",
      currentNodeId: "node_edo_01",
      discoveredNodeIds: ["node_edo_01"],
      clearedNodeIds: [],
      discoveredShrineNodeIds: [],
      idleFarmNodeId: null,
      isIdleFarming: false,

      setCurrentNode: (regionId, nodeId) =>
        set({ currentRegionId: regionId, currentNodeId: nodeId }),

      discoverNode: (nodeId) =>
        set((state) => {
          if (state.discoveredNodeIds.includes(nodeId)) return state;
          return { discoveredNodeIds: [...state.discoveredNodeIds, nodeId] };
        }),

      clearNode: (nodeId) =>
        set((state) => {
          if (state.clearedNodeIds.includes(nodeId)) return state;
          return { clearedNodeIds: [...state.clearedNodeIds, nodeId] };
        }),

      discoverShrine: (nodeId) =>
        set((state) => {
          if (state.discoveredShrineNodeIds.includes(nodeId)) return state;
          return {
            discoveredShrineNodeIds: [...state.discoveredShrineNodeIds, nodeId],
            discoveredNodeIds: state.discoveredNodeIds.includes(nodeId)
              ? state.discoveredNodeIds
              : [...state.discoveredNodeIds, nodeId],
          };
        }),

      travelToShrine: (nodeId) =>
        set((state) => {
          if (!state.discoveredShrineNodeIds.includes(nodeId)) return state;
          return { currentNodeId: nodeId };
        }),

      startIdleFarm: (nodeId) => {
        const { clearedNodeIds } = get();
        if (!clearedNodeIds.includes(nodeId)) return;
        set({ idleFarmNodeId: nodeId, isIdleFarming: true });
      },

      stopIdleFarm: () => set({ isIdleFarming: false }),

      isNodeDiscovered: (nodeId) => get().discoveredNodeIds.includes(nodeId),

      isNodeCleared: (nodeId) => get().clearedNodeIds.includes(nodeId),
    }),
    { name: "cursed-japan-map" }
  )
);
