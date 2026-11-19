import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CounterStore {
  count: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
  increaseBy: (amount: number) => void;
  decreaseBy: (amount: number) => void;
  setCount: (amount: number) => void;

  label: string;
  setLabel: (value: string) => void;
}

export const useCounterStore = create<CounterStore>()(
  persist(
    (set) => ({
      count: 0,
      label: "Counter A",
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
      setCount: (amount) => {
        set({ count: amount });
      },
      setLabel: (value) => {
        set({ label: value });
      },
    }),
    {
      name: "counter-storage",
    },
  ),
);
