import { create } from "zustand";

const useClaimStore = create((set) => ({
    claims: [],
    setClaims: (claims) => set({ claims }),
}));

export default useClaimStore;
