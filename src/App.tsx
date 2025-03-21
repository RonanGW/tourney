import { useState, useEffect } from 'react'
import FightRandomizer from './Fight/FightRandomizer'
import Gallery from './Gallery/Gallery'
import Settings from './Settings/Settings'
import "./index.css"
import tdata from './trainers.json'
import 'react-tooltip/dist/react-tooltip.css'
import FightSelect from './Fight/FightSelect'

//Primary Page (Main Loop). Critical States should originate from here so they are consistent
function App() {
  const [menu, setMenu] = useState("Main-Menu") //Key to determin which menu the player is on
  const [trainers, setTrainers] = useState(tdata) //Object extrapolated data. This is passed to most objects and changed frequently. Consider it the core data. Needs to be saved at end of session

  //console.log(trainers)
  return (
    // Conditional switch to determine which page is rendered
    <div className='App'>
      {menu == "Main-Menu" ? 
        <div className='App-content'>
          <button onClick={() => {setMenu("Fight")}}>
            Random Tourney
          </button>
          <button onClick={() => {setMenu("Fight-Select")}}>
            Set Tourney
          </button>
          <button onClick={() => {setMenu("Gallery")}}>
            Gallery
          </button>
          <button onClick={() => {setMenu("Settings")}}>
            Settings
          </button>
          <button onClick={() => {setMenu("Customize")}}>
            Custom Add-ons
          </button>
        </div>:
      menu == "Fight" ?
        <FightRandomizer menu={[menu,setMenu]} trainers={[trainers, setTrainers]}></FightRandomizer> :
      menu == "Fight-Select" ?
        <FightSelect menu={[menu,setMenu]} trainers={[trainers, setTrainers]}></FightSelect> :
      menu == "Gallery" || menu == "Gallery-Trainer" ?
        <Gallery menu={[menu,setMenu]} inheritedTrainerData={[trainers, setTrainers]}></Gallery> :
      menu == "Settings" ?
        <Settings menu={[menu,setMenu]} tdata={trainers}></Settings> :
      <div>Oops. Something broke :/</div>}
    </div>
  );
}

export default App;
