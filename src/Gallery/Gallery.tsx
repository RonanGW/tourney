import React, { useState, useEffect } from 'react'
import './Gallery.css'
import CharCard from './TrainerPage/CharCard'
import MonCard from './MonPage/MonCard'

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
  cost: number; //How many BP it costs to purchase this mon once it goes from 'hidden' to 'locked'
}

// Generic data structure for a 'trainer'
interface trainer {
      state: string; //The state of this trainer, (i.e. Unlocked, Locked or Hidden)
      region: string; //Home region of this trainer. (Used primarily for sorting)
      class: string; //This trainer's class. (Used primarily for sorting)
      w: number; //Total number of tourney wins for this trainer
      l: number; //Total number of tourney losses for this trainer
      BP: number; //Available BP for this trainer (Game Currency)
      mons: object //Object containing all mon data for this trainer
};

// Gallery Menu
function Gallery({menu, trainers}: Gallery) {
    const trainerObjects: [string,trainer][]  = Object.entries(trainers[0]) // Trainer data as an array
    const [filters, setFilters] = useState(["Unlocked","Available","Locked"]); // Actively displayed trainer & mon statuses
    const [cards, setCards] = useState(filterTrainerCards()); // Currently display "Cards"
    const [currTrainer, setCurrTrainer] = useState(trainers[0]["red"]); //Current trainer to display
    const [selectedMon, setSelectedMon] = useState({name:"mon",form:"none",shine:"none",state:"blank",lvl:0,xp:0,hp:0,atk:0,cost:999}) //Current Mon to display inside trainer screen

  // Reset's the display to the starting Gallery Screen
  function switchToMainScreen() {
    menu[1]("Gallery"); //setMenu function for the menu state defined & passed by parent object
    setSelectedMon({name:"mon",form:"none",shine:"none",state:"blank",lvl:0,xp:0,hp:0,atk:0,cost:999})
    setCards(filterTrainerCards());
  }

  // Resets the display to the selected trainer's details page
  function switchToTrainerScreen(trainer: any) {
    menu[1]("Gallery-Trainer"); //setMenu function for the menu state defined & passed by parent object
    setCurrTrainer(trainer)
    setCards(filterMonCards(trainer));
  }

  // Resets the display to the selected mon's details page
  function switchToMonScreen(mon: mon) {
    menu[1]("Mon"); //setMenu function for the menu state defined & passed by parent object
  }

  // Returns an array of Trainer Cards to display using currently selected Filters
  function filterTrainerCards(): JSX.Element[] {
    let newCards: JSX.Element[] = []; //Array to be filled with cards
    
    //Loop through each trainer and if their status is active, create a card for them and add it to the display list.
    for (let [tkey,value] of trainerObjects) {
      filters.includes(value.state) ? newCards.push(
        <div onClick={() => switchToTrainerScreen(value)}>
            <CharCard trainer={value}></CharCard>
        </div>
      ) : <></>
    }
    return newCards
  }

  // Returns an array of Mon Cards to display using currently selected Filters
  function filterMonCards(trainer: any): JSX.Element[] {
    let newCards: JSX.Element[] = []; //Array to be filled with cards

    let mons = Object.entries<mon>(trainer.mons); //Turns the passed trainers mons object into an array

    //Loop through each mon and if their status is active, create a card for them and add it to the display list.
    for (let [tkey,value] of mons) {
        filters.includes(value.state) ? newCards.push(
          <div onClick={() => {setSelectedMon(value)}}>
              <MonCard mon={value}></MonCard>
          </div>
        ) : <></>
      }
      return newCards
  }

  function purchaseMon(trainer: trainer, mon: mon): void {
      if (trainer.BP >= mon.cost) {
        mon.state="Unlocked"
        trainer.BP = trainer.BP - mon.cost
        setCards(filterMonCards(trainer))
      }
  }

  function TrainerPage(trainer: trainer): JSX.Element {

    return <div className="Gallery-content">
            <div className="Gallery-vertical-panel">
                <CharCard trainer={trainer}></CharCard>
                <div className="Gallery-info-panel">
                    {trainer.state == "Unlocked" ? 
                        <div>
                            <p>Region: {trainer.region}</p>
                            <p>Trainer Class: {trainer.class}</p>
                            <p>Wins: {trainer.w}</p>
                            <p>Losses: {trainer.l}</p>
                            <p>BP: {trainer.BP}</p>
                        </div> :
                        <p>Play a round to unlock the next trainer!</p>
                    }
                </div>
            </div>
            <div className="Gallery-vertical-panel">
                {selectedMon.state == "blank" ? "" : 
                    <div className="Gallery-vertical-panel">
                        <MonCard mon={selectedMon}></MonCard>
                        <div className="Gallery-info-panel">
                            { selectedMon.state == "Unlocked" ?
                            <div>
                                <p>Level: {selectedMon.lvl}</p>
                                <p>XP: {selectedMon.xp}</p>
                                <p>HP: {selectedMon.hp}</p>
                                <p>Atk: {selectedMon.atk}</p>
                            </div> :
                            selectedMon.state == "Available" ?
                                <button onClick={() => {purchaseMon(trainer, selectedMon)}}>Purchase for {selectedMon.cost}BP</button> :
                                <p>Continue Raising your current mons to unlock this Mon for purchase.</p>
                            }
                        </div>
                    </div>}
            </div>
            <div className="Card-block">
                {cards}
            </div>
        </div>
  }
  
  return (
    <div className="Gallery">
        {menu[0] == "Gallery" ? 
          <div>
            <div className="Gallery-header">
              <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
            </div>
            <div className="Card-block">
              {cards}
            </div>
          </div> : 
         menu[0] == "Gallery-Trainer" ? 
          <div>
            <div className="Gallery-header">
              <button onClick={switchToMainScreen}>Back to Gallery Main Screen</button>
            </div>
              {TrainerPage(currTrainer)}
          </div> :  
          <div>
            <div className="Gallery-header">
              <button onClick={switchToMainScreen}>Back to Gallery Main Screen</button>
            </div> 
            <div>Oops. Something broke :/</div>
          </div>
        }
    </div>
  );
}

export default Gallery;
