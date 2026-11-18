import { useCounterStore } from "../stores/useCounterStore";

const LabelDisplay = () => {
    const label = useCounterStore(state=>state.label)
    console.log("LabelDisplay Render")
  return (
    <p>label : {label}</p>
  )
}

export default LabelDisplay