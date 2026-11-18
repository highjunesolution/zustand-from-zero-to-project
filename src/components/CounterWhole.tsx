import { useCounterStore } from "../stores/useCounterStore";
// import { useShallow } from "zustand/shallow";

const CounterWhole = () => {
  const store = useCounterStore();
  //   const data = useCounterStore(
  //     useShallow((state) => ({
  //       count: state.count,
  //       label: state.label,
  //     })),
  //   );

  console.log("CounterWhole Render");
  return <h2>Whole: {store.count}</h2>;
};

export default CounterWhole;
