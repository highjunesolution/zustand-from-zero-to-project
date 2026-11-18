import { useCounterStore } from "../stores/useCounterStore";

const CounterDisplay = () => {
  const count = useCounterStore(state=>state.count);

  console.log("ConterDisplay Render");
  
  return (
    <h2>Count : {count}</h2>
  )
}

export default CounterDisplay