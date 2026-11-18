import { useCounterStore } from "../stores/useCounterStore";

const CounterButtons = () => {
  const increase = useCounterStore((state) => state.increase);
  const decrease = useCounterStore((state) => state.decrease);
  const reset = useCounterStore((state) => state.reset);
  return (
    <div style={{display: "flex", gap: 10}}>
      <button onClick={increase}>Increase +1</button>
      <button onClick={decrease}>Decrease -1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default CounterButtons;
