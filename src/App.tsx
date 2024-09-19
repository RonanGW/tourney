import { parseJsonText } from 'typescript'
import './App.css'
import CharCard from './CharCard'
import tdata from './trainers.json'

function App() {

  return (
    <div className="App">
      <div className="Content">
        <CharCard trainer={tdata.red}></CharCard>
      </div>
    </div>
  );
}

export default App;
