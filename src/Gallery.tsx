import React, { useState, useEffect } from 'react'
import './Gallery.css'
import CharCard from './CharCard'
import tdata from './trainers.json'

function Gallery() {
    const [menu, setMenu] = useState("Gallery")
    const [filters, setFilters] = useState(["Unlocked","Locked"]);
    const [cards, setCards] = useState(filterCards());

  function filterCards(): JSX.Element {
    let newCards: JSX.Element[] = []; 

    const trainers = Object.entries(tdata);
    
    for (let [tkey,value] of trainers) {
      filters.includes(value.state) ? newCards.push(
        <CharCard trainer={value} state={" " + value.state}></CharCard>
      ) : <></>
    }
    return <div className='TrainerCardList'>{newCards}</div>
}

  return (
    <div className="Gallery">
      {cards}
    </div>
  );
}

export default Gallery;
