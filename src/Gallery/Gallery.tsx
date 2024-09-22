import React, { useState, useEffect } from 'react'
import './Gallery.css'
import CharCard from './TrainerPage/CharCard'
import MonCard from './MonPage/MonCard'
import tdata from '../trainers.json'

interface Gallery {
  menu: any[]
}

interface mon {
  state: string;
  lvl: number;
  xp: number;
  hp: number;
  atk: number;
  cost: number;
}

interface trainer {
      state: string;
      region: string;
      class: string;
      w: number;
      l: number;
      BP: number;
      mons: object
};

function Gallery({menu}: Gallery) {
    const [filters, setFilters] = useState(["Unlocked","Available","Locked"]);
    const [cards, setCards] = useState(filterTrainerCards());
    const [currTrainer, setCurrTrainer] = useState(tdata["red"]);
    const [selectedMon, setSelectedMon] = useState({state:"blank",lvl:0,xp:0,hp:0,atk:0,cost:999})

  function filterTrainerCards(): JSX.Element[] {
    let newCards: JSX.Element[] = []; 

    const trainers = Object.entries(tdata);
    
    for (let [tkey,value] of trainers) {
      filters.includes(value.state) ? newCards.push(
        <div onClick={() => switchToTrainerScreen(value)}>
            <CharCard trainer={value}></CharCard>
        </div>
      ) : <></>
    }
    return newCards
  }

  function filterMonCards(trainer: any): JSX.Element[] {
    let newCards: JSX.Element[] = []; 

    let mons = Object.entries<mon>(trainer.mons);

    for (let [tkey,value] of mons) {
        filters.includes(value.state) ? newCards.push(
          <div onClick={() => {setSelectedMon(value)}}>
              <MonCard mon={value}></MonCard>
          </div>
        ) : <></>
      }
      return newCards
  }

  function switchToMainScreen() {
    menu[1]("Gallery");
    setSelectedMon({state:"blank",lvl:0,xp:0,hp:0,atk:0,cost:999})
    setCards(filterTrainerCards());
  }

  function switchToTrainerScreen(trainer: any) {
    menu[1]("Gallery-Trainer");
    setCurrTrainer(trainer)
    setCards(filterMonCards(trainer));
  }

  function switchToMonScreen(mon: mon) {
    menu[1]("Mon");
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
        <div className="Gallery-header">
          <button onClick={switchToMainScreen}>Back to Gallery Main Screen</button>
        </div>
        {menu[0] == "Gallery" ? 
            <div className="Card-block">
              {cards}
            </div> : 
         menu[0] == "Gallery-Trainer" ? 
            TrainerPage(currTrainer) :
         <div>Oops. Something broke :/</div>
        }
    </div>
  );
}

export default Gallery;
