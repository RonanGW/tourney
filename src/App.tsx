import React, { useState, useEffect } from 'react'
import Gallery from './Gallery/Gallery'
import "./index.css"

function App() {
  const [menu, setMenu] = useState("Main-Menu")

  return (
    <div className='App'>
      {menu == "Main-Menu" ? 
        <div>
          <button>
            Start Round
          </button>
          <button onClick={() => {setMenu("Gallery")}}>
            Gallery
          </button>
          <button>
            Settings
          </button>
          <button>
            Custom Add-ons
          </button>
        </div>:
      menu == "Gallery" || menu == "Gallery-Trainer" ?
        <Gallery menu={[menu,setMenu]}></Gallery> :
      <div>Oops. Something broke :/</div>}
    </div>
  );
}

export default App;
