import { create } from "zustand";

const useEmotionsStore = create((set) => ({
  emotions: [],
  setEmotions: (emotions) => set({ emotions }),
}));

export default useEmotionsStore;