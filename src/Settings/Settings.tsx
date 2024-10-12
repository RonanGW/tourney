import React, { useState, useEffect } from 'react'
import './Settings.css'

interface Settings {
  menu: any[] // passes the current state (i.e. menu) to this page so it can be undone. Value is [state,setState]
}

function localDownload(data: any) {
  const blob = new Blob([JSON.stringify(resetSave(JSON.parse(data)))], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'trainers.json'); // Set the desired file name

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetSave(data: any) {

  let trainersSaveData: any = {}

  data.trainers.forEach((trainer: any) => {
    trainersSaveData[trainer[0].toLowerCase()] = {
        name: trainer[0],
        state: "Unlocked",
        starter: trainer[1],
        class: trainer[3],
        region: trainer[2],
        w: 0,
        l: 0,
        BP: 0,
        mons: {}
    }

    data.mons.forEach((mon: any) => {
      let monState = "Hidden"
      mon.name.toLowerCase() == trainer[1] ? monState = "Unlocked" : monState = "Hidden"
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

function Settings({menu}: Settings) {
    
  const [data,setData] = useState("N/A")
  
  fetch('/defaults.json').then(response => {return response.json()}).then(tmp => setData(JSON.stringify(tmp)))

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