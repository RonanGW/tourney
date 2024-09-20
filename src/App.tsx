import React, { useState, useEffect } from 'react'
import './App.css'
import CharCard from './CharCard'
import tdata from './trainers.json'

function App() {

  function sortCards(): JSX.Element {
    let cards: JSX.Element[] = []; 
    const entries = Object.entries(tdata);
    
    for (let [tkey,value] of entries) {
      cards.push(
        <CharCard trainer={value}></CharCard>
      )
    }
    return <div>{cards}</div>
}


  return (
    <div className="App">
      <div className="Content">
      {sortCards()}
      </div>
    </div>
  );
}

export default App;
