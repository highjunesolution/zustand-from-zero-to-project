import { useCounterStore } from "../stores/useCounterStore";

const LabelButtons = () => {
  const setLabel = useCounterStore((state) => state.setLabel);

  return (
    <div>
      <button onClick={() => setLabel("Counter B")}>
        Change to B
        </button>

      <button onClick={() => setLabel("Counter A")}>
        Change to A
        </button>
    </div>
  );
};

export default LabelButtons;
