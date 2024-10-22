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
    trainersSaveData[trainer[0].toLowerCase()] = {
        name: trainer[0],
        state: "Unlocked",
        starter: trainer[1],
        class: trainer[4],
        region: trainer[3],
        w: 0,
        l: 0,
        BP: 0,
        mons: {}
    }

    //Intialize each mon for each trainer
    data.mons.forEach((mon: any) => {
      let monState = "Hidden"
      if (mon.name.toLowerCase() == trainer[1] && mon.form.toLowerCase() == trainer[2]) {monState = "Unlocked"} else {monState = "Locked"}
        trainersSaveData[trainer[0].toLowerCase()].mons[mon.name.toLowerCase() + mon.form.toLowerCase()] = {
            name: mon.name,
            form: mon.form,
            shine: "",
            state: monState,
            lvl: 1,
            xp: 0,
            hp: 1,
            atk: 1,
            cost: mon.cost
        }
      //Intialize the shiny version of each mon for each trainer
      mon.name.toLowerCase() == trainer[1] ? monState = "Locked" : monState = "Hidden"
        trainersSaveData[trainer[0].toLowerCase()].mons[mon.name.toLowerCase() + mon.form.toLowerCase() + "shiny"] = {
          name:  mon.name,
          form: mon.form,
          shine: "Shiny",
          state: monState,
          lvl: 1,
          xp: 0,
          hp: 1,
          atk: 1,
          cost: mon.cost * 2
      }
    })
  });

  return trainersSaveData
}

// Settings Menu
function Settings({menu}: Settings) {
    
  let data = "N/A" // Initial Placeholder for the content to be read from 
  
  // Replaces data variable with the contents of defaults.json in the game's folder 
  fetch('/defaults.json').then(response => {return response.json()}).then(tmp => data = JSON.stringify(tmp))

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