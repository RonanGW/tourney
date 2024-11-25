import { useState, useEffect } from 'react'
import Fight from './Fight/Fight'
import Gallery from './Gallery/Gallery'
import Settings from './Settings/Settings'
import "./index.css"
import tdata from './trainers.json'

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
            Start Tourney
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
        <Fight menu={[menu,setMenu]} trainers={[trainers, setTrainers]}></Fight> :
      menu == "Gallery" || menu == "Gallery-Trainer" ?
        <Gallery menu={[menu,setMenu]} trainers={[trainers, setTrainers]}></Gallery> :
      menu == "Settings" ?
        <Settings menu={[menu,setMenu]} tdata={trainers}></Settings> :
      <div>Oops. Something broke :/</div>}
    </div>
  );
}

export default App;
