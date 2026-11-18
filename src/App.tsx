import CounterButtons from "./components/CounterButtons";
import CounterDisplay from "./components/CounterDisplay";
import CounterWhole from "./components/CounterWhole";
import LabelButtons from "./components/LabelButtons";
import LabelDisplay from "./components/LabelDisplay";

const App = () => {
  return (
    <>
      <CounterWhole/>
      <CounterDisplay/>

      <CounterButtons/>

      <LabelDisplay/>
      <LabelButtons/>
    </>
  )
}

export default App