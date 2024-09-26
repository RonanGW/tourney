import React, { useState, useEffect } from 'react'
import './Settings.css'

interface Settings {
  menu: any[]
}

function localDownload() {
  const blob = new Blob([JSON.stringify(resetSave())], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'trainers.json'); // Set the desired file name

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function resetSave() {

  let trainersSaveData: any = {}


  //["Kanto","Johto","Hoenn","Sinnoh","Unova","Kalos","Alola","Galar","Paldea","Hisui","Ransei"]
  //["Hero","Champion","Rival","Professor","Boss","Elite Four","Admin","Gym Leader"]
  let trainers = [["Red","charmander","Kanto","Hero"],
                  ["Blue","squirtle","Kanto","Rival"],
                  ["Leaf","bulbasaur","Kanto","Hero"],
                  ["Lance","dratini","Kanto","Champion"],
                  ["Steven","beldum","Hoenn","Champion"],
                  ["Wallace","feebas","Hoenn","Champion"],
                  ["Cynthia","gible","Sinnoh","Champion"],
                  ["Alder","larvesta","Unova","Champion"],
                  ["Iris","deino","Unova","Champion"],
                  ["Diantha","ralts","Kalos","Champion"],
                  ["Kukui","rockruff","Alola","Professor"],
                  ["Leon","charmander","Galar","Champion"],
                  ["Geeta","glimmet","Paldea","Champion"]
                 ]

  let mons = [{name: "Bulbasaur", cost: 2},
              {name: "Charmander", cost: 2}
             ]

  trainers.forEach(trainer => {
    trainersSaveData[trainer[0].toLowerCase()] = {
        name: trainer[0],
        state: "Locked",
        class: trainer[3],
        region: trainer[2],
        w: 0,
        l: 0,
        BP: 0,
        mons: {}
    }

    mons.forEach(mon => {
        trainersSaveData[trainer[0].toLowerCase()].mons[mon.name.toLowerCase()] = {
            name: mon.name,
            state: "Locked",
            lvl: 1,
            xp: 0,
            hp: 1,
            atk: 1,
            cost: mon.cost
        }
    })
  });
  //const file = writeFileSync('./trainers.json',trainersSaveData);
  //let data = fs.writeFileSync('./trainers.json',trainersSaveData)

  return trainersSaveData
}

function Settings({menu}: Settings) {
    
  const [tmp,setTmp] = useState("N/A")

    return (
    <div className="Settings">
        <button onClick={() => {localDownload()}}>Reset Save data</button>
        <p>{tmp}</p>
    </div>
  );
}

export default Settings