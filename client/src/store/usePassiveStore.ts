import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PassiveStore {
  allocatedNodeIds: string[];
  totalPointsSpent: number;
  totalPointsAvailable: number;

  allocateNode: (nodeId: string) => void;
  deallocateNode: (nodeId: string) => void;
  grantPassivePoint: (count?: number) => void;
  resetAllNodes: () => void;
}

export const usePassiveStore = create<PassiveStore>()(
  persist(
    (set) => ({
      allocatedNodeIds: ["node_start"],
      totalPointsSpent: 0,
      totalPointsAvailable: 0,

      allocateNode: (nodeId) =>
        set((state) => {
          if (state.allocatedNodeIds.includes(nodeId)) return state;
          if (state.totalPointsAvailable <= 0) return state;
          return {
            allocatedNodeIds: [...state.allocatedNodeIds, nodeId],
            totalPointsSpent: state.totalPointsSpent + 1,
            totalPointsAvailable: state.totalPointsAvailable - 1,
          };
        }),

      deallocateNode: (nodeId) =>
        set((state) => {
          if (!state.allocatedNodeIds.includes(nodeId)) return state;
          if (nodeId === "node_start") return state;
          return {
            allocatedNodeIds: state.allocatedNodeIds.filter((id) => id !== nodeId),
            totalPointsSpent: Math.max(0, state.totalPointsSpent - 1),
            totalPointsAvailable: state.totalPointsAvailable + 1,
          };
        }),

      grantPassivePoint: (count = 1) =>
        set((state) => ({
          totalPointsAvailable: state.totalPointsAvailable + count,
        })),

      resetAllNodes: () =>
        set((state) => ({
          allocatedNodeIds: ["node_start"],
          totalPointsAvailable: state.totalPointsAvailable + state.totalPointsSpent,
          totalPointsSpent: 0,
        })),
    }),
    { name: "cursed-japan-passive" }
  )
);
