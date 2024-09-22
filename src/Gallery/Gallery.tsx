import React, { useState, useEffect } from 'react'
import './Gallery.css'
import CharCard from './TrainerPage/CharCard'
import MonCard from './MonPage/MonCard'
import tdata from '../trainers.json'

interface mon {
    "state": string,
}

function Gallery() {
    const [menu, setMenu] = useState("Gallery")
    const [filters, setFilters] = useState(["Unlocked","Locked"]);
    const [currTrainer, setCurrTrainer] = useState(tdata["red"]);
    const [cards, setCards] = useState(filterTrainerCards());

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
          <div>
              <MonCard mon={value}></MonCard>
          </div>
        ) : <></>
      }
      return newCards
  }

  function switchToMainScreen() {
    setMenu("Gallery");
    setCards(filterTrainerCards());
  }

  function switchToTrainerScreen(trainer: any) {
    setMenu("Trainer");
    setCurrTrainer(trainer)
    setCards(filterMonCards(trainer));
  }

  function switchToMonScreen(mon: any) {
    setMenu("Mon");
  }

  return (
    <div className="Gallery">
        <div className="Gallery-header">
          <button onClick={switchToMainScreen}>Back to Gallery Main Screen</button>
        </div>
        {menu == "Gallery" ? 
            <div className="Card-block">
              {cards}
            </div> : 
         menu == "Trainer" ? 
            <div className="Card-block">
              <CharCard trainer={currTrainer}></CharCard>
              {cards}
            </div> : 
         menu == "Mon" ? 
            <div className="TrainerCardList"> 
            </div> :
         <div>Oops. Something broke :/</div>
        }
    </div>
  );
}

export default Gallery;
