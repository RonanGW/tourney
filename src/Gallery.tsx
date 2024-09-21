import React, { useState, useEffect } from 'react'
import './Gallery.css'
import CharCard from './CharCard'
import MonCard from './MonCard'
import tdata from './trainers.json'

interface mon {
    "state": string,
    "lvl": number,
    "xp": number,
    "hp": number,
    "atk": number
}

function Gallery() {
    const [menu, setMenu] = useState("Gallery")
    const [filters, setFilters] = useState(["Unlocked","Locked"]);
    const [currTrainer, setCurrTrainer] = useState(tdata["red"]);
    const [cards, setCards] = useState(filterTrainerCards());

  function filterTrainerCards(): JSX.Element {
    let newCards: JSX.Element[] = []; 

    const trainers = Object.entries(tdata);
    
    for (let [tkey,value] of trainers) {
      filters.includes(value.state) ? newCards.push(
        <div onClick={() => switchToTrainerScreen(value)}>
            <CharCard trainer={value} state={" " + value.state}></CharCard>
        </div>
      ) : <></>
    }
    return <div className='TrainerCardList'>{newCards}</div>
  }

  function filterMonCards(trainer: any): JSX.Element {
    let newCards: JSX.Element[] = []; 

    let mons = Object.entries<mon>(trainer.mons);

    for (let [tkey,value] of mons) {
        filters.includes(value.state) ? newCards.push(
          <div>
              <MonCard mon={value} state={" " + value.state}></MonCard>
          </div>
        ) : <></>
      }
      return <div className='TrainerCardList'>{newCards}</div>
  }

  function switchToTrainerScreen(trainer: any) {
    setMenu("Trainer");
    setCurrTrainer(trainer)
    setCards(filterMonCards(trainer));
  }

  return (
    menu == "Gallery" ? 
                <div className="Gallery">
                    {cards}
                </div> :
    menu == "Trainer" ? 
                <div className="Gallery">
                    <CharCard trainer={currTrainer} state={" " + currTrainer.state}></CharCard>
                    {cards}
                </div> :
    menu == "Mon" ? 
                <></> :
                <div>Oops. Something broke :/</div>
  );
}

export default Gallery;
