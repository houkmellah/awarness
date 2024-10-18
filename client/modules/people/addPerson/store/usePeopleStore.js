import { create } from 'zustand'

const usePeopleStore = create((set) => ({
  people: [],
  setPeople: (people) => set({ people }),
  addPerson: (person) => set((state) => ({ people: [...state.people, person] })),
}))

export default usePeopleStore;