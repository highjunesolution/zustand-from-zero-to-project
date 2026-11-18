import { useCounterStore } from "../stores/useCounterStore";

const CounterButtons = () => {
  const increase = useCounterStore((state) => state.increase);
  const decrease = useCounterStore((state) => state.decrease);
  const reset = useCounterStore((state) => state.reset);
  const increaseBy = useCounterStore((state)=>state.increaseBy);
  const decreaseBy = useCounterStore((state)=>state.decreaseBy);
  const setCount = useCounterStore((state)=>state.setCount);
  return (
    <div style={{display: "flex", gap: 10}}>
      <button onClick={increase}>Increase +1</button>
      <button onClick={decrease}>Decrease -1</button>
      <button onClick={reset}>Reset</button>
      <button onClick={()=>increaseBy(5)}>Increase +5</button>
      <button onClick={()=>decreaseBy(5)}>Decrease +5</button>
      <button onClick={()=>setCount(100)}>Set 100</button>
    </div>
  );
};

export default CounterButtons;
