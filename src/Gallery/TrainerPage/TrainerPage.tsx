import React, { useState, useEffect } from 'react'
import CharCard from "./CharCard"
import MonCard from "../MonPage/MonCard"
import '../Gallery.css'

interface TrainerPage {
    trainer: any;
}

interface mon {
    "state": string;
    "lvl": number;
    "xp": number;
    "hp": number;
    "atk": number;
}

const TrainerPage = ({trainer}: TrainerPage) => {
    const [filters, setFilters] = useState(["Unlocked","Locked"]);
    const [currMons, setCurrMons] = useState(filterMons(trainer));
    const [selectedMon, setSelectedMon] = useState({state:"blank","lvl":0,"xp":0,"hp":0,"atk":0})

    function filterMons(trainer: any): JSX.Element[] {
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

    return (
        <div className="Gallery-content">
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
                                <button>Purchase for X BP</button> :
                                <p>Continue Raising your current mons to unlock this Mon for purchase.</p>
                            }
                        </div>
                    </div>}
            </div>
            <div className="Card-block">
                {currMons}
            </div>
        </div>
    )
}

export default TrainerPage