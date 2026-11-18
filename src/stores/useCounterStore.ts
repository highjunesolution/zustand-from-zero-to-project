import { create } from "zustand";

interface CounterStore {
  count: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
  increaseBy: (amount: number) => void;
  decreaseBy: (amount: number) => void;
  setCount: (amount:number)=> void;
}

export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,
  increase: () => {
    set((state) => ({ count: state.count + 1 }));
  },
  decrease: () => {
    set(({ count }) => ({ count: count - 1 }));
  },
  reset: () => {
    set({ count: 0 });
  },
  increaseBy: (amount) => {
    set(({ count }) => ({ count: count + amount }));
  },
  decreaseBy: (amount) => {
    set(({ count }) => ({ count: count - amount }));
  },
  setCount: (amount)=>{
    set({count: amount})
  }
}));
