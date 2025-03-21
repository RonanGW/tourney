import React, { useState, useEffect } from 'react'
import Select, { StylesConfig } from 'react-select'
import CharCard from '../Gallery/TrainerPage/CharCard'

//Interface to pass state variables created by parent object
interface FightSelect {
    menu: any[] // passes the current state (i.e. gallery menu) to this page so it can be undone. Value is [state<string>,setState()]
    trainers: any[] // Current trainer data for populating most up to date character info. Value is [state<trainer>,setState()]
}

// Generic data structure for a 'trainer'
interface trainer {
  name: string; //The display name of the trainer
  state: string; //The state of this trainer, (i.e. Unlocked, Locked or Hidden)
  team: string[];
  starterForm: string; //The active starting mon's form
  attacker: number;
  region: string; //Home region of this trainer. (Used primarily for sorting)
  class: string; //This trainer's class. (Used primarily for sorting)
  w: number; //Total number of tourney wins for this trainer
  l: number; //Total number of tourney losses for this trainer
  BP: number; //Available BP for this trainer (Game Currency)
  mons: any //Object containing all mon data for this trainer
  };

let toRender = false

function FightSelect({menu, trainers}: FightSelect) {
  const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0])) //Filtered duplicate of trainer data modified to indicate the modifiable nature of this menu and onlly include 8 random selections
                                                                      .filter((t) => t[1].state == "Unlocked"))
                                                                      .sort(() => 0.5 - Math.random()))
                                                                      .slice(0, 8)))
  //Collect all regions for filters
  let tNames = [...new Set([...new Set((Object.entries<trainer>(trainers[0])).map(item => item[0]))].map(item => {return {value: item, label: item}}))];
  const [selTrainers, setSelTrainers] = useState([currTrainers[Object.keys(currTrainers)[0]],
                                                  currTrainers[Object.keys(currTrainers)[1]],
                                                  currTrainers[Object.keys(currTrainers)[2]],
                                                  currTrainers[Object.keys(currTrainers)[3]],
                                                  currTrainers[Object.keys(currTrainers)[4]],
                                                  currTrainers[Object.keys(currTrainers)[5]],
                                                  currTrainers[Object.keys(currTrainers)[6]],
                                                  currTrainers[Object.keys(currTrainers)[7]]
                                                ])
  const [selButtons,setSelButtons] = useState(() => {let selButtonDivList = genSelButtons();
                                                return <>
                                                <div style={{display:"flex", flexWrap:"wrap"}}>{selButtonDivList.splice(4,4)}</div>
                                                <div style={{display:"flex", flexWrap:"wrap"}}>{selButtonDivList.splice(0,4)}</div>
                                              </>})
  const [extraRenderer,setExtraRenderer] = useState(0)
  
  useEffect(() => {
  
          if (toRender) {
              console.log(currTrainers)
              let selButtonDivList = genSelButtons()
              setSelButtons(<>
                <div style={{display:"flex", flexWrap:"wrap"}}>{selButtonDivList.splice(4,4)}</div>
                <div style={{display:"flex", flexWrap:"wrap"}}>{selButtonDivList.splice(0,4)}</div>
              </>)
              //console.log(selTrainers)
              toRender = false
          }
      });

  function genSelButtons(): JSX.Element[] { 
  let selButtons: JSX.Element[] = []

  let updatedTNames = tNames
  for (let i = 0; i < selTrainers.length; i++) {
    updatedTNames = updatedTNames.filter((e) => {if (e.value != selTrainers[i].name) {return e}})
  }
  tNames = updatedTNames

  for (let i = 0; i < selTrainers.length; i++) {
    selButtons.push(
      <div>
      <div className='filter-wrap'><Select 
        styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                  "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                  }),
                indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
              }}
        classNamePrefix="multiselect" 
        defaultValue={{value: selTrainers[i].name,label: selTrainers[i].name}}
        closeMenuOnSelect={false} 
        placeholder="States" 
        onChange={(e) => {let tmp = selTrainers; e != null ? tmp[i] = trainers[0][e.value] : console.log("");setSelTrainers(tmp);toRender = true;setExtraRenderer(Math.random())}}
        options={tNames}/>
      </div>
      <CharCard trainer={selTrainers[i]}/>
      </div>
    )
  }

  return selButtons
  }

  return (
  <>
  {selButtons}
  <button onClick={() => {menu[1]("Fight")}}>
    Start Tourney
  </button>
  </>
  )
}

export default FightSelect