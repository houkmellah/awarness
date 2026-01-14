import { create } from "zustand";

const useBeliefStore = create((set) => ({
  beliefs: [],
  setBeliefs: (beliefs) => set({ beliefs }),
}));

export default useBeliefStore;
