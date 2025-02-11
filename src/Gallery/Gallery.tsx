import { useState, useEffect } from 'react'
import Select, { StylesConfig } from 'react-select'
import CharCard from './TrainerPage/CharCard'
import MonCard from './MonPage/MonCard'
import FileSaver from 'file-saver';
import TextField from "@mui/material/TextField";
import './Gallery.css'
//Interface to pass state variables created by parent object
interface Gallery {
  menu: any[] // passes the current state (i.e. gallery menu) to this page so it can be undone. Value is [state<string>,setState()]
  inheritedTrainerData: any[] // Current trainer data for populating most up to date character info. Value is [state<trainer>,setState()]
}

// Generic data structure for a 'mon'
interface mon {
  name: string, //The mon's name
  form: string, //The mon's from ("" if none)
  shine:string, //The mon's shine ("" if none)
  state: string; //The state of this mon for this trainer, (i.e. Unlocked, Locked or Hidden)
  lvl: number; //The mon's current level
  xp: number; //The mon's current xp prior to leveling. (Cap is their current level which will let them level up)
  hp: number; //The mon's current total HP
  atk: number; //Unused for now. Currently damage is just equal to mon's level
  //cost: number; //How many BP it costs to purchase this mon once it goes from 'hidden' to 'locked'
}

// Generic data structure for a 'trainer'
interface trainer {
  name: string; //The display name of the trainer
  state: string; //The state of this trainer, (i.e. Unlocked, Locked or Hidden)
  team: string[];
  region: string; //Home region of this trainer. (Used primarily for sorting)
  class: string; //This trainer's class. (Used primarily for sorting)
  w: number; //Total number of tourney wins for this trainer
  l: number; //Total number of tourney losses for this trainer
  BP: number; //Available BP for this trainer (Game Currency)
  mons: any //Object containing all mon data for this trainer
};

let renderTrainers = false //Representation of current render
let renderMons = false //Representation of current render
let dex: any = {};fetch('/dex.json').then(response => {return response.json()}).then(tmp => dex = tmp)//Storing dex info for mondata to reference more detail not stored in individual mon data. This is to reduce duplicate info such as region be duplicated for each individual mon for each trainer or the same info being copied for each mon's shine state

// Gallery Menu
function Gallery({menu, inheritedTrainerData}: Gallery) {
  const inheritedTrainerDataEntries: [string,trainer][]  = Object.entries(inheritedTrainerData[0]) // Trainer data as an array
  //Collect all regions for filters
  const regions = [...new Set([...new Set(inheritedTrainerDataEntries.map(item => item[1].region))].map(item => {return {value: item, label: item}}))];
  //Collect all classes for filters
  const classes = [...new Set([...new Set(inheritedTrainerDataEntries.map(item => item[1].class))].map(item => {return {value: item, label: item}}))];
  //List possible types for filters
  const types = [
    { value: 'Bug', label: 'Bug'},
    { value: 'Dark', label: 'Dark'},
    { value: 'Dragon', label: 'Dragon'},
    { value: 'Electric', label: 'Electric'},
    { value: 'Fairy', label: 'Fairy'},
    { value: 'Fighting', label: 'Fighting'},
    { value: 'Fire', label: 'Fire'},
    { value: 'Flying', label: 'Flying'},
    { value: 'Ghost', label: 'Ghost'},
    { value: 'Grass', label: 'Grass'},
    { value: 'Ground', label: 'Ground'},
    { value: 'Ice', label: 'Ice'},
    { value: 'Normal', label: 'Normal'},
    { value: 'Null', label: 'Null'},
    { value: 'Poison', label: 'Poison'},
    { value: 'Psychic', label: 'Psychic'},
    { value: 'Rock', label: 'Rock'},
    { value: 'Steel', label: 'Steel'},
    { value: 'Water', label: 'Water'},
  ];
  //List possible shines for filters
  const shines = [
    { value: '', label: 'Normal'},
    { value: 'Shiny', label: 'Shiny'},
    { value: 'Albino', label: 'Albino'},
    { value: 'Melanistic', label: 'Melanistic'},
  ]
  //List possible fates for filters
  const states = [
    { value: 'Unlocked', label: 'Unlocked'},
    { value: 'Available', label: 'Available'},
    { value: 'Locked', label: 'Locked'}
  ]
  
  const [inputText, setInputText] = useState(""); //Used to stored value for the search functions
  const [selectedRegions, setSelectedRegions] = useState(regions.map((r) => r.value)); //Actively displayed trainer & mon home regions
  const [selectedClasses, setSelectedClasses] = useState(classes.map((c) => c.value)); //Actively displayed trainer classes
  const [selectedTypes, setSelectedTypes] = useState(types.map((t) => t.value)); //Actively displayed mon types
  const [selectedShines, setSelectedShines] = useState(shines.map((t) => t.value)); //Actively displayed mon shines
  const [selectedStates, setSelectedStates] = useState(["Unlocked","Available"]); // Actively displayed trainer & mon states
  const [cards, setCards] = useState(filterTrainerCards("none")); // Currently display "Cards"
  const [currTrainer, setCurrTrainer] = useState(inheritedTrainerData[0]["red"]); //Current trainer to display
  const [selectedMon, setSelectedMon] = useState({name:"mon",form:"none",shine:"none",state:"blank",lvl:0,xp:0,hp:0,atk:0,spd:0,cost:999}) //Current Mon to display inside trainer screen
  const [loggedChanges, setLoggedChanges] = useState({})
  const [party, setParty] = useState([<></>]); //PartyButtons
  const [partySlotReplacers, setPartySlotReplacers] = useState(false) //Reveals hidden buttons if team is full

  //This useEffect is set to re-render manually when the trigger is set to true
  //Also functions as a primary debugging function for seeing the most up to date changes
  useEffect(() => {
    // Update the document title using the browser API

    if (renderTrainers) {
        setCards(filterTrainerCards("none"))
        renderTrainers = false
    }
    else if (renderMons) {
      setCards(filterMonCards(currTrainer,""))
      setParty(genPartyButtons)
      menu[1]("Gallery-Trainer"); //setMenu function for the menu state defined & passed by parent object
      renderMons = false
    }
  });

  let inputHandler = (e: any) => {
    setInputText(e.target.value.toLowerCase());
  };

  // Reset's the display to the starting Gallery Screen
  function switchToMainScreen() {
    menu[1]("Gallery"); //setMenu function for the menu state defined & passed by parent object
    setInputText("")
    setSelectedMon({name:"mon",form:"none",shine:"none",state:"blank",lvl:0,xp:0,hp:0,atk:0,spd:0,cost:999})
    setCards(filterTrainerCards("none"));
  }

  // Resets the display to the selected trainer's details page
  function switchToTrainerScreen(trainer: any) {
    fetch('/Savedata/'+trainer.name+'.json')
    .then(response => {return response.json()})
    .then((tdata) => {
      renderMons = true
      setInputText("")
      setCurrTrainer(tdata)
      setCards(filterMonCards(tdata,""));
    });
  }

  // Returns an array of Trainer Cards to display using currently selected Filters
  function filterTrainerCards(sorted: string): JSX.Element[] {
    let newCards: JSX.Element[] = []; //Array to be filled with cards
    let tObjectsNoKeys: any[] = Object.entries(inheritedTrainerData[0]).map(x => x[1]) // Filters keys out of inheritedTrainerDataEntries to make data an array of objects instead an array of entries

    //Sorts Trainer Objects by BP to put trainers with the most BP at the top.
    if (sorted == "BPA") {
      tObjectsNoKeys = tObjectsNoKeys.sort((a:any,b:any) => b.BP - a.BP)
    }
    else if (sorted == "NameA") {
      tObjectsNoKeys = tObjectsNoKeys.sort(function(a:any, b:any) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })
    }
    else if (sorted == "BPD") {
      tObjectsNoKeys = tObjectsNoKeys.sort((a:any,b:any) => a.BP - a.BP)
    }
    else if (sorted == "NameD") {
      tObjectsNoKeys = tObjectsNoKeys.sort(function(a:any, b:any) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textB < textA) ? -1 : (textB > textA) ? 1 : 0;
    })
    }

    //Loop through each trainer and if the filters match, create a card for them and add it to the display list.
    for (let value of tObjectsNoKeys) {
      value.name.toLowerCase().includes(inputText) && 
      selectedStates.includes(value.state) && 
      (value.state!="Unlocked" || selectedRegions.includes(value.region)) && 
      (value.state!="Unlocked" || selectedClasses.includes(value.class)) ? newCards.push(
        <div key={Math.random()} onClick={() => switchToTrainerScreen(value)}>
            <CharCard trainer={value}></CharCard>
        </div>
      ) : <></>
    }

    return newCards
  }

  // Returns an array of Mon Cards to display using currently selected Filters
  function filterMonCards(trainer: any, sorted: string): JSX.Element[] {
    let newCards: JSX.Element[] = []; //Array to be filled with cards
    let mons = Object.entries<any>(currTrainer.mons).map(x => x[1]); //Turns the passed trainers mons object into an array
      
    if (sorted == "lvlA") {
      mons = mons.sort((a: any,b: any) => b.lvl - a.lvl)
    }
    else if (sorted == "hpA") {
      mons = mons.sort((a: any,b: any) => b.hp - a.hp)
    }
    else if (sorted == "atkA") {
      mons = mons.sort((a: any,b: any) => b.atk - a.atk)
    }
    else if (sorted == "spdA") {
      mons = mons.sort((a: any,b: any) => b.spd - a.spd)
    }
    else if (sorted == "lvlD") {
      mons = mons.sort((a: any,b: any) => a.lvl - b.lvl)
    }
    else if (sorted == "hpD") {
      mons = mons.sort((a: any,b: any) => a.hp - b.hp)
    }
    else if (sorted == "atkD") {
      mons = mons.sort((a: any,b: any) => a.atk - b.atk)
    }
    else if (sorted == "spdD") {
      mons = mons.sort((a: any,b: any) => a.spd - b.spd)
    }

    //Loop through each mon and if the filters match, create a card for them and add it to the display list.
    for (let value of mons) {
      (inputText == "" || (value.state == "Unlocked" && value.name.toLowerCase().includes(inputText))) && 
      selectedStates.includes(value.state) && 
      (value.state!="Unlocked" || selectedShines.includes(value.shine)) && 
      (value.state!="Unlocked" || selectedRegions.includes(dex.mons[value.name + value.form].region)) && 
      (value.state!="Unlocked" || (selectedTypes.includes(dex.mons[value.name + value.form].type1) || 
      selectedTypes.includes(dex.mons[value.name + value.form].type2))) ? 
        newCards.push(
          <div onClick={() => {setSelectedMon(value)}}>
              <MonCard mon={value}></MonCard>
          </div>
        ) : <></>
    }
    setSelectedMon(currTrainer.mons[currTrainer.team[0]])

    return newCards
  }

  //Returns array of clickable images on the trainer stats card to indicate the trainers current team
  function genPartyButtons(): JSX.Element[] {
    let buttons: JSX.Element[] = []

    //Loop through each keay included in the currTrainers team
    for (let mon of currTrainer.team) {
      //Calc image file name
      let monForm = currTrainer.mons[mon].form ? ' ' + currTrainer.mons[mon].form : ''
      let monShine = currTrainer.mons[mon].shine ? ' (Shiny)' : ''
      buttons.push(<img style={{width: "72px", height: "72px"}} onClick={() => {setSelectedMon(currTrainer.mons[mon])}} 
                        src={'./chars/mons/'+ dex.mons[currTrainer.mons[mon].name + currTrainer.mons[mon].form].name.toLowerCase()+ monForm + monShine +'.png'}
                    />)
    }

    return  buttons
  }

  //Unlocks an availabe mon for a given trainer in exchange for BP
  function purchaseMon(trainer: trainer, mon: mon): void {
      if (inheritedTrainerData[0][trainer.name].BP >= dex.mons[mon.name + mon.form].cost) {
        mon.state="Unlocked"
        inheritedTrainerData[0][trainer.name].BP = inheritedTrainerData[0][trainer.name].BP - dex.mons[mon.name + mon.form].cost
          trainer.mons[mon.name + mon.form + mon.shine.toLowerCase()] = mon

        //Loops through each mon to see if will become available after leveling this mon, therefore making the looped mon visible, but locked
        for (const key in trainer.mons) {
          if (trainer.mons[key].state == "Hidden") {
            if (trainer.mons[key].shine == mon.shine) {
              if (dex.mons[trainer.mons[key].name + trainer.mons[key].form].unlocker == mon.name + mon.form + mon.shine.toLowerCase()) {
                trainer.mons[key].state = "Locked"
                renderMons = true
                setSelectedMon(currTrainer.mons[currTrainer.team[0]])
                setCurrTrainer(currTrainer)
              }
            }
            else if (trainer.mons[key].name + trainer.mons[key].form == mon.name + mon.form) {
              trainer.mons[key].state = "Locked"
              renderMons = true
              setSelectedMon(currTrainer.mons[currTrainer.team[0]])
              setCurrTrainer(currTrainer)
            }
          }
        }

        //Save changes
        const timeoutId = window.setTimeout(() => {
          const blob = new Blob([JSON.stringify(trainer)], { type: 'application/json' });
          FileSaver.saveAs(blob, trainer.name +".json");
        }, 500)

        //Save changes
        const timeoutId2 = window.setTimeout(() => {
          const blob = new Blob([JSON.stringify(inheritedTrainerData[0])], { type: 'application/json' });
          FileSaver.saveAs(blob, "trainers.json");
        }, 500)
        
      }
  }

  function buffStat(trainer: trainer, mon: mon, stat: string) {
    inheritedTrainerData[0][trainer.name].BP = inheritedTrainerData[0][trainer.name].BP - 1
    console.log(stat)
    console.log(trainer.mons[mon.name + mon.form + mon.shine])
    trainer.mons[mon.name + mon.form + mon.shine][stat] =  trainer.mons[mon.name + mon.form + mon.shine][stat] + 1
    setSelectedMon(currTrainer.mons[currTrainer.team[0]])

    console.log(trainer.mons[mon.name + mon.form + mon.shine][stat])


    //Save changes
    const timeoutId = window.setTimeout(() => {
      const blob = new Blob([JSON.stringify(trainer)], { type: 'application/json' });
      FileSaver.saveAs(blob, trainer.name +".json");
    }, 500)

    //Save changes
    const timeoutId2 = window.setTimeout(() => {
      const blob = new Blob([JSON.stringify(inheritedTrainerData[0])], { type: 'application/json' });
      FileSaver.saveAs(blob, "trainers.json");
    }, 500)
  }

  function changeTeam(trainer: trainer, mon: mon, slot: number):void {
    let key = (mon.name + mon.form + mon.shine.toLowerCase())
    slot < 0 ? trainer.team.splice(trainer.team.indexOf(key), 1) : trainer.team.length < 6 ? trainer.team.push(key) : trainer.team[slot] = key

    const timeoutId = window.setTimeout(() => {
      const blob = new Blob([JSON.stringify(trainer)], { type: 'application/json' });
      FileSaver.saveAs(blob, trainer.name +".json");
    }, 500)

    setPartySlotReplacers(false)
  }

  //Sets the object to display the 'Trainer Page' content, which is the trainer selected, their details and all the mons they have that are unlocked or available next
  //Also allows the user to open a display revealing the details of each of their mons
  function TrainerPage(trainer: trainer): JSX.Element {
    return <div className="Gallery-content">
            <div className="Gallery-vertical-panel">
                <CharCard trainer={trainer}></CharCard>
                <div className="Gallery-info-panel">
                    {trainer.state == "Unlocked" ? 
                        <div>
                            <div><u>Region</u><div>{trainer.region}</div></div>
                            <div><u>Trainer Class</u><div>{trainer.class}</div></div>
                            <p>Wins: {trainer.w}</p>
                            <p>Losses: {trainer.l}</p>
                            <p>BP: {inheritedTrainerData[0][trainer.name].BP}</p>
                            <p><u>Party</u></p>
                            <div className='flexRow partyBlock'>{party}</div>
                        </div> :
                        <p>Play a round to unlock the next trainer!</p> 
                    }
                </div>
            </div>
            <div className="Gallery-vertical-panel">
                {selectedMon.state == "blank" ? "" : 
                    <div>
                        <MonCard mon={selectedMon}></MonCard>
                        <div className="Gallery-info-panel">
                            {selectedMon.state == "Unlocked" ?
                            <div>
                                {trainer.team.includes(selectedMon.name + selectedMon.form + selectedMon.shine) ?
                                  trainer.team.length > 1 ? <button onClick={() =>{changeTeam(trainer,selectedMon,-1)}}>Remove from team</button> : <></> :
                                  trainer.team.length < 6 ? <button onClick={() =>{changeTeam(trainer,selectedMon,5)}}>Add to team</button> :
                                  !partySlotReplacers ? <button onClick={() =>{setPartySlotReplacers(true)}}>Add to team</button> : 
                                  !trainer.team.includes(selectedMon.name + selectedMon.form + selectedMon.shine) ? <div>
                                  <button onClick={() => {changeTeam(trainer,selectedMon,0)}}>1</button>
                                  <button onClick={() => {changeTeam(trainer,selectedMon,1)}}>2</button>
                                  <button onClick={() => {changeTeam(trainer,selectedMon,2)}}>3</button>
                                  <button onClick={() => {changeTeam(trainer,selectedMon,3)}}>4</button>
                                  <button onClick={() => {changeTeam(trainer,selectedMon,4)}}>5</button>
                                  <button onClick={() => {changeTeam(trainer,selectedMon,5)}}>6</button></div> :<></>

                                 }
                                <p>Level: {selectedMon.lvl}</p>
                                <div className='flexRow'>
                                <img src={"/icons/"+dex.mons[selectedMon.name + selectedMon.form].type1 + ".png"} className='typeImg'/>
                                  {dex.mons[selectedMon.name + selectedMon.form].type2 != "" ?
                                  <img src={"/icons/"+dex.mons[selectedMon.name + selectedMon.form].type2 + ".png"} className='typeImg'/> :
                                  undefined}
                                </div>
                                <p>XP: {selectedMon.xp}</p>
                                <div className='flexRow center'><p>HP: {selectedMon.hp}</p>{trainer.BP > 0 ? <button onClick={() => {buffStat(trainer,selectedMon,"hp")}}>+1</button>:<></>}</div>
                                <div className='flexRow center'><p>Atk: {selectedMon.atk}</p>{trainer.BP > 0 ? <button onClick={() => {buffStat(trainer,selectedMon,"atk")}}>+1</button>:<></>}</div>
                                <div className='flexRow center'><p>Spd: {selectedMon.spd}</p>{trainer.BP > 0 ? <button onClick={() => {buffStat(trainer,selectedMon,"spd")}}>+1</button>:<></>}</div>
                            </div> :
                            selectedMon.state == "Available" ?
                                <button onClick={() => {purchaseMon(trainer, selectedMon)}}>Purchase for {dex.mons[selectedMon.name + selectedMon.form].cost}BP</button> :
                                <p>Continue Raising your current mons to unlock this Mon for purchase.</p>
                            }
                        </div>
                    </div>}
            </div>
            <div className='Gallery-sortBlock'>
              <div className='filter-block='>
                <div className='flexRow'>
              <div className='flexCol'>
              <div className='SearchBar'>
              <TextField
                  id="outlined-basic"
                  onChange={(e) => {renderMons = true;inputHandler(e)}}
                  variant="outlined"
                  fullWidth
                  label="Search"
                />
                </div>
                <div className='flexRow'>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"lvlA"))}}>Sort by Lvl▼</button>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"lvlD"))}}>Sort by Lvl▲</button>
                </div>
                <div className='flexRow'>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"hpA"))}}>Sort by HP▼</button>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"hpD"))}}>Sort by HP▲</button>
                </div>
                <div className='flexRow'>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"atkA"))}}>Sort by Atk▼</button>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"atkD"))}}>Sort by Atk▲</button>
                </div>
                <div className='flexRow'>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"spdA"))}}>Sort by Spd▼</button>
                  <button onClick={() => {setCards(filterMonCards(currTrainer,"spdD"))}}>Sort by Spd▲</button>
                </div>
                </div>
                  <div className='flexCol'>
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                            control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                            "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                            }),
                            indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                            clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                            dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                          }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedStates.map((val) => {return {label: val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="States" 
                  onChange={(e) => {renderMons = true;setSelectedStates([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={states}/>
                </div>}
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                            control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                            "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                            }),
                            indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                            clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                            dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                          }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedTypes.map((val) => {return {label: val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="Types" 
                  onChange={(e) => {renderMons = true;setSelectedTypes([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={types}/>
                </div>}
                </div>
                <div className='flexCol'>
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                            control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                            "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                            }),
                            indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                            clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                            dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                          }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedRegions.map((val) => {return {label: val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="Regions" 
                  onChange={(e) => {renderMons = true;setSelectedRegions([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={regions}/>
                </div>}
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                            control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                              "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                              }),
                            indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                            clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                            dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                          }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedShines.map((val) => {return {label: val == "" ? "Normal" : val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="Shines" 
                  onChange={(e) => {renderMons = true;setSelectedShines([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={shines}/>
                </div>}
                </div>
              </div>
              </div>
              <div className="Card-block">
                  {cards}
              </div>
            </div>
        </div>
  }
  

  //{<MultiSelect value={selectedStates} onChange={(e) => {renderMons = true;setSelectedStates(e.value)}} options={states} optionLabel="name" display="chip"
 // filter placeholder="States" maxSelectedLabels={selectedStates.length} className="filter md:filter" />}
 //             {<MultiSelect value={selectedTypes} onChange={(e) => {renderMons = true;setSelectedTypes(e.value)}} options={types} optionLabel="name" display="chip"
 // filter placeholder="Type" maxSelectedLabels={selectedTypes.length} className="filter md:filter" />}
 //             {<MultiSelect value={selectedRegions} onChange={(e) => {renderMons = true;setSelectedRegions(e.value)}} options={regions} optionLabel="name" display="chip"
 // filter placeholder="Region" maxSelectedLabels={selectedRegions.length} className="filter md:filter" />}
 //             {<MultiSelect value={selectedShines} onChange={(e) => {renderMons = true;setSelectedShines(e.value)}} options={shines} optionLabel="name" display="chip"
 // filter placeholder="Shine" maxSelectedLabels={selectedShines.length} className="filter md:filter" />}



 // {<MultiSelect value={selectedStates} onChange={(e) => {renderTrainers = true;setSelectedStates(e.value)}} options={states} optionLabel="name" display="chip"
 // filter placeholder="States" maxSelectedLabels={selectedStates.length} className="filter md:filter" />}
 //             {<MultiSelect value={selectedRegions} onChange={(e) => {renderTrainers = true;setSelectedRegions(e.value)}} options={regions} optionLabel="name" display="chip"
//  filter placeholder="Regions" maxSelectedLabels={selectedRegions.length} className="filter md:filter" />}
////              {<MultiSelect value={selectedClasses} onChange={(e) => {renderTrainers = true;setSelectedClasses(e.value)}} options={classes} optionLabel="name" display="chip"
//  filter placeholder="Classes" maxSelectedLabels={selectedClasses.length} className="filter md:filter" />}



  //Returns the Gallery object, which would allow users to view trainer details and make purchases 
  return (
    <div className="Gallery">
        {menu[0] == "Gallery" ? 
          <div>
            <div className="Gallery-header">
              <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
            </div>
            <div>
            <div className='filter'>
              <div className='flexCol'>
                <div 
                  className='SearchBar'>
              <TextField
                  id="outlined-basic"
                  onChange={(e) => {renderTrainers = true;inputHandler(e)}}
                  variant="outlined"
                  fullWidth
                  label="Search"
                />
                </div>
                <div className='flexCol'>
                  <div className='flexRow'>
                    <button onClick={() => {setCards(filterTrainerCards("BPA"))}}>Sort by BP▼</button>
                    <button onClick={() => {setCards(filterTrainerCards("BPD"))}}>Sort by BP▲</button>
                  </div>
                  <div className='flexRow'>
                    <button onClick={() => {setCards(filterTrainerCards("NameA"))}}>Sort A-Z▼</button>
                    <button onClick={() => {setCards(filterTrainerCards("NameD"))}}>Sort A-Z▲</button>
                  </div>
                  </div>
                </div>
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                           control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                            "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                            }),
                           indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                           clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                           dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                         }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedStates.map((val) => {return {label: val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="States" 
                  onChange={(e) => {renderTrainers = true;setSelectedStates([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={states}/>
                </div>}
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5'}),
                  control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                   "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                   }),
                            indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                            clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                            dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                          }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedRegions.map((val) => {return {label: val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="Regions" 
                  onChange={(e) => {renderTrainers = true;setSelectedRegions([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={regions}/>
                </div>}
              {<div className='filter-wrap'><Select isMulti 
                  styles={{multiValue: (baseStyles, state) => ({...baseStyles,backgroundColor:'#77D5D5',}),
                           control: (baseStyles, state) => ({...baseStyles,backgroundColor:'#cdeaea',border: "solid thick blue",width:"15vw",height:"10vh",overflow:"hidden",scrollbarColor: "#C5D3F5 #4D6AAD",paddingRight:"10px",paddingBottom:"10px",
                                                              "&:hover": {overflow:"scroll",scrollbarWidth: "thin",paddingRight:"0px",paddingBottom:"0px"}
                                                            }),
                            indicatorsContainer: (baseStyles, state) => ({...baseStyles,display: "flex",alignSelf: "flex-start",top:"0",position:"sticky"}),
                            clearIndicator: (baseStyles, state) => ({...baseStyles,color:'black'}),
                            dropdownIndicator: (baseStyles, state) => ({...baseStyles,color:'black',})
                          }}
                  classNamePrefix="multiselect" 
                  defaultValue={selectedClasses.map((val) => {return {label: val, value: val}})} 
                  closeMenuOnSelect={false} 
                  placeholder="Classes" 
                  onChange={(e) => {renderTrainers = true;setSelectedClasses([...new Set(Object.entries(e).map(item => item[1].value))])}} 
                  options={classes}/>
                </div>}
              </div>
              <div className="Card-block">
                {cards}
              </div>
            </div>
          </div> : 
         menu[0] == "Gallery-Trainer" ? 
          <div>
            <div className="Gallery-header">
              <button onClick={() => {switchToMainScreen()}}>Back to Gallery Main Screen</button>
            </div>
              {TrainerPage(currTrainer)}
          </div> :  
          <div>
            <div className="Gallery-header">
              <button onClick={() => {switchToMainScreen()}}>Back to Gallery Main Screen</button>
            </div> 
            <div>Oops. Something broke :/</div>
          </div>
        }
    </div>
  );
}

export default Gallery;
