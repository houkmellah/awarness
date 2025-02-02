import { create } from "zustand";

const useFearStore = create((set) => ({
  fears: [],
  setfears: (fears) => set({ fears }),
}));

export default useFearStore;
