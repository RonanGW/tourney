import React, { useState, useEffect } from 'react'
import Fight from './Fight/Fight'
import Gallery from './Gallery/Gallery'
import Settings from './Settings/Settings'
import "./index.css"

function App() {
  const [menu, setMenu] = useState("Main-Menu")

  return (
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
        <Fight menu={[menu,setMenu]}></Fight> :
      menu == "Gallery" || menu == "Gallery-Trainer" ?
        <Gallery menu={[menu,setMenu]}></Gallery> :
      menu == "Settings" ?
        <Settings menu={[menu,setMenu]}></Settings> :
      <div>Oops. Something broke :/</div>}
    </div>
  );
}

export default App;
