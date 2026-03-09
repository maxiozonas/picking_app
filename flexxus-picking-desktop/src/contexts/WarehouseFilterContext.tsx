import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WarehouseFilterState {
  selectedWarehouseId: number | null
  setSelectedWarehouseId: (id: number | null) => void
  clearFilter: () => void
}

export const useWarehouseFilterStore = create<WarehouseFilterState>()(
  persist(
    (set) => ({
      selectedWarehouseId: null,
      setSelectedWarehouseId: (id) => set({ selectedWarehouseId: id }),
      clearFilter: () => set({ selectedWarehouseId: null }),
    }),
    {
      name: 'warehouse-filter-storage',
    }
  )
)
