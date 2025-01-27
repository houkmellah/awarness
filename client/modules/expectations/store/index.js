import { create } from "zustand";

const useExpectationStore = create((set) => ({
    expectations: [],
    setExpectations: (expectations) => set({ expectations }),
}));

export default useExpectationStore;