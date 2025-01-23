import { useState, useEffect } from 'react'
import Select, { StylesConfig } from 'react-select'
import CharCard from './TrainerPage/CharCard'
import MonCard from './MonPage/MonCard'
import FileSaver from 'file-saver';
import './Gallery.css'
//Interface to pass state variables created by parent object
interface Gallery {
  menu: any[] // passes the current state (i.e. gallery menu) to this page so it can be undone. Value is [state<string>,setState()]
  trainers: any[] // Current trainer data for populating most up to date character info. Value is [state<trainer>,setState()]
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
function Gallery({menu, trainers}: Gallery) {
  const allTrainers: [string,trainer][]  = Object.entries(trainers[0]) // Trainer data as an array
  //Collect all regions for filters
  const regions = [...new Set([...new Set(allTrainers.map(item => item[1].region))].map(item => {return {value: item, label: item}}))];
  //Collect all classes for filters
  const classes = [...new Set([...new Set(allTrainers.map(item => item[1].class))].map(item => {return {value: item, label: item}}))];
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

  const [selectedRegions, setSelectedRegions] = useState(regions.map((r) => r.value)); //Actively displayed trainer & mon home regions
  const [selectedClasses, setSelectedClasses] = useState(classes.map((c) => c.value)); //Actively displayed trainer classes
  const [selectedTypes, setSelectedTypes] = useState(types.map((t) => t.value)); //Actively displayed mon types
  const [selectedShines, setSelectedShines] = useState(shines.map((t) => t.value)); //Actively displayed mon shines
  const [selectedStates, setSelectedStates] = useState(["Unlocked","Available"]); // Actively displayed trainer & mon states
  const [cards, setCards] = useState(filterTrainerCards("none")); // Currently display "Cards"
  const [currTrainer, setCurrTrainer] = useState(trainers[0]["red"]); //Current trainer to display
  const [selectedMon, setSelectedMon] = useState({name:"mon",form:"none",shine:"none",state:"blank",lvl:0,xp:0,hp:0,atk:0,spd:0,cost:999}) //Current Mon to display inside trainer screen
  const [party, setParty] = useState([<></>]); //PartyButtons
  const [partySlotReplacers, setPartySlotReplacers] = useState(false)

  //This useEffect is set to re-render manually when the trigger is set to true
  //Also functions as a primary debugging function for seeing the most up to date changes
  useEffect(() => {
    // Update the document title using the browser API

    if (renderTrainers) {
        setCards(filterTrainerCards("none"))
        renderTrainers = false
    }
    else if (renderMons) {
      setCards(filterMonCards(currTrainer))
      setParty(genPartyButtons)
      menu[1]("Gallery-Trainer"); //setMenu function for the menu state defined & passed by parent object
      renderMons = false
    }
  });

  // Reset's the display to the starting Gallery Screen
  function switchToMainScreen() {
    menu[1]("Gallery"); //setMenu function for the menu state defined & passed by parent object
    setSelectedMon({name:"mon",form:"none",shine:"none",state:"blank",lvl:0,xp:0,hp:0,atk:0,spd:0,cost:999})
    setCards(filterTrainerCards("none"));
  }

  // Resets the display to the selected trainer's details page
  function switchToTrainerScreen(trainer: any) {
    fetch('/Savedata/'+trainer.name+'.json')
    .then(response => {return response.json()})
    .then((tdata) => {
      renderMons = true
      setCurrTrainer(tdata)
      setCards(filterMonCards(tdata));
    });
    setSelectedRegions(Object.entries(regions).map(item => item[1].value))
    setSelectedStates(Object.entries(states).map(item => item[1].value))
  }

  // Returns an array of Trainer Cards to display using currently selected Filters
  function filterTrainerCards(sorted: string): JSX.Element[] {
    let newCards: JSX.Element[] = []; //Array to be filled with cards
    let tObjectsNoKeys = allTrainers.map(x => x[1]) // Filters keys out of allTrainers to make data an array of objects instead an array of entries

    //Sorts Trainer Objects by BP to put trainers with the most BP at the top.
    if (sorted == "BP") {
      tObjectsNoKeys = tObjectsNoKeys.sort((a,b) => b.BP - a.BP)
    }

    //Loop through each trainer and if the filters match, create a card for them and add it to the display list.
    for (let value of tObjectsNoKeys) {
      selectedStates.includes(value.state) && selectedRegions.includes(value.region) && selectedClasses.includes(value.class) ? newCards.push(
        <div key={Math.random()} onClick={() => switchToTrainerScreen(value)}>
            <CharCard trainer={value}></CharCard>
        </div>
      ) : <></>
    }

    return newCards
  }

  // Returns an array of Mon Cards to display using currently selected Filters
  function filterMonCards(trainer: any): JSX.Element[] {
    let trainerData: any
    fetch('/Savedata/'+trainer.name+'.json')
    .then(response => {return response.json()})
    .then((tData) => {
      trainerData = tData
    });

    let newCards: JSX.Element[] = []; //Array to be filled with cards
    const timeoutId = window.setTimeout(() => {
      let mons = Object.entries<any>(trainerData.mons); //Turns the passed trainers mons object into an array
      //Loop through each mon and if the filters match, create a card for them and add it to the display list.
      for (let [tkey,value] of mons) {
        selectedStates.includes(value.state) && 
        selectedShines.includes(value.shine) && 
        selectedRegions.includes(dex.mons[value.name + value.form].region) && 
        (selectedTypes.includes(dex.mons[value.name + value.form].type1) || 
        selectedTypes.includes(dex.mons[value.name + value.form].type2)) ? 
          newCards.push(
            <div onClick={() => {setSelectedMon(value)}}>
                <MonCard mon={value}></MonCard>
            </div>
          ) : <></>
        }
      setSelectedMon(trainerData.mons[trainerData.team[0]])
    }, 500)

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
      if (trainers[0][trainer.name].BP >= dex.mons[mon.name + mon.form].cost) {
        mon.state="Unlocked"
        trainers[0][trainer.name].BP = trainers[0][trainer.name].BP - dex.mons[mon.name + mon.form].cost
          trainer.mons[mon.name + mon.form + mon.shine.toLowerCase()] = mon

        //Loops through each mon to see if will become available after leveling this mon, therefore making the looped mon visible, but locked
        for (const key in trainer.mons) {
          if (trainer.mons[key].state == "Hidden") {
            if (trainer.mons[key].shine == mon.shine) {
              if (dex.mons[trainer.mons[key].name + trainer.mons[key].form].unlocker == mon.name + mon.form + mon.shine.toLowerCase()) {
                trainer.mons[key].state = "Locked"
              }
            }
            else if (trainer.mons[key].name + trainer.mons[key].form == mon.name + mon.form) {
              trainer.mons[key].state = "Locked"
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
          const blob = new Blob([JSON.stringify(trainers[0])], { type: 'application/json' });
          FileSaver.saveAs(blob, "trainers.json");
        }, 500)
        
      }
  }

  function buffStat(trainer: trainer, mon: mon, stat: string) {
    trainers[0][trainer.name].BP = trainers[0][trainer.name].BP - 1
    console.log(stat)
    console.log(trainer.mons[mon.name + mon.form + mon.shine])
    trainer.mons[mon.name + mon.form + mon.shine][stat] =  trainer.mons[mon.name + mon.form + mon.shine][stat] + 1

    console.log(trainer.mons[mon.name + mon.form + mon.shine][stat])


    //Save changes
    const timeoutId = window.setTimeout(() => {
      const blob = new Blob([JSON.stringify(trainer)], { type: 'application/json' });
      FileSaver.saveAs(blob, trainer.name +".json");
    }, 500)

    //Save changes
    const timeoutId2 = window.setTimeout(() => {
      const blob = new Blob([JSON.stringify(trainers[0])], { type: 'application/json' });
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
                            <p>BP: {trainers[0][trainer.name].BP}</p>
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
              <div className='filter-block'>
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="States" onChange={(e) => {renderMons = true;setSelectedStates([...new Set(Object.entries(e).map(item => item[1].value))])}} options={states}/></div>}
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="Types" onChange={(e) => {renderMons = true;setSelectedTypes([...new Set(Object.entries(e).map(item => item[1].value))])}} options={types}/></div>}
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="Regions" onChange={(e) => {renderMons = true;setSelectedRegions([...new Set(Object.entries(e).map(item => item[1].value))])}} options={regions}/></div>}
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="Shines" onChange={(e) => {renderMons = true;setSelectedShines([...new Set(Object.entries(e).map(item => item[1].value))])}} options={shines}/></div>}
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
                <button onClick={() => {setCards(filterTrainerCards("BP"))}}>Filter by BP</button>
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="States" onChange={(e) => {renderTrainers = true;setSelectedStates([...new Set(Object.entries(e).map(item => item[1].value))])}} options={states} /></div>}
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="Regions" onChange={(e) => {renderTrainers = true;setSelectedRegions([...new Set(Object.entries(e).map(item => item[1].value))])}} options={regions}/></div>}
              {<div className='filter-wrap'><Select isMulti classNamePrefix="multiselect" closeMenuOnSelect={false} placeholder="Classes" onChange={(e) => {renderTrainers = true;setSelectedClasses([...new Set(Object.entries(e).map(item => item[1].value))])}} options={classes}/></div>}
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
