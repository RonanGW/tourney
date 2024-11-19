import React, { useState, useEffect } from 'react'
import './Settings.css'

interface Settings {
  menu: any[] // passes the current state (i.e. settings menu) to this page so it can be undone. Value is [state,setState()]
}

//locally downloads the data file for a reset game
function localDownload(data: any) {
  //Creates the content to be written
  const blob = new Blob([JSON.stringify(resetSave(JSON.parse(data)))], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  //Creates a temporary html element to download content
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'trainers.json'); // Set the desired file name

  //Adds Element to page, activates it, then deletes the element
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Returns a object containing the default starting state for a save based on the content provided in defaults.json
function resetSave(data: any) {

  let trainersSaveData: any = {} //For storing the default data scheme to be downloaded

  //Initialize each trainer using a lowercase version of their name as the key
  data.trainers.forEach((trainer: any) => {
    trainersSaveData[trainer.name] = {
        name: trainer.name,
        state: "Unlocked",
        starter: trainer.starter + trainer.starterForm,
        class: trainer.class,
        region: trainer.region,
        w: 0,
        l: 0,
        BP: 0,
        mons: {}
    }
  });

  
    //Intialize each mon for each trainer
    Object.keys(data.mons).forEach((monKey: any) => {
      data.trainers.forEach((trainer: any) => {
      let monState = "Hidden"
      if (data.mons[monKey].name == trainer.starter && data.mons[monKey].form == trainer.starterForm //If trainer default starter and form match
      ) {monState = "Unlocked"}
      else if (data.mons[monKey].name == trainer.starter || data.mons[monKey].unlocker == "" ||  data.mons[monKey].unlocker == trainer.starter + trainer.starterForm//If trainer default starter, a default reveal or revealed based starter, set to reveal. Otherwise, hide
      ) {monState = "Locked"} else {monState = "Hidden"}
        trainersSaveData[trainer.name].mons[data.mons[monKey].name + data.mons[monKey].form] = {
            name: data.mons[monKey].name,
            form: data.mons[monKey].form,
            shine: "",
            state: monState,
            lvl: 1,
            xp: 0,
            hp: 1,
            atk: 1
        }
      //Intialize the shiny version of each mon for each trainer
      data.mons[monKey].name == trainer.starter ? monState = "Locked" : monState = "Hidden"
        trainersSaveData[trainer.name].mons[data.mons[monKey].name + data.mons[monKey].form + "shiny"] = {
          name:  data.mons[monKey].name,
          form: data.mons[monKey].form,
          shine: "Shiny",
          state: monState,
          lvl: 1,
          xp: 0,
          hp: 1,
          atk: 1
      }
    })
  });

  return trainersSaveData
}

// Settings Menu
function Settings({menu}: Settings) {
    
  let data = "N/A" // Initial Placeholder for the content to be read from 
  
  // Replaces data variable with the contents of defaults.json in the game's folder 
  fetch('/dex.json').then(response => {return response.json()}).then(tmp => data = JSON.stringify(tmp))

    return (
      <div>
        <div className="Gallery-header">
          <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>
        <div className="Settings">
          <button onClick={() => {localDownload(data)}}>Reset Save data</button>
        </div>
      </div>
  );
}

export default Settings