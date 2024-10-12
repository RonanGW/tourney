import React, { useState, useEffect } from 'react'
import './Fight.css'

interface Fight {
  menu: any[]
  trainers: any[]

}

interface mon {
  state: string;
  lvl: number;
  xp: number;
  hp: number;
  currHP: number;
  atk: number;
  cost: number;
}

interface trainer {
    name: string;
    state: string;
    starter: string;
    region: string;
    class: string;
    w: number;
    l: number;
    BP: number;
    mons: any
};


function Fight({menu, trainers}: Fight) {
    const [allTrainers, setAllTrainers] = useState<[string,trainer][]>(Object.entries(trainers[0]));
    const [remainingTrainers, setRemainingTrainers] = useState<[string,trainer][]>((((allTrainers).filter((t) => t[1].state == "Unlocked")).sort(() => 0.5 - Math.random())).slice(0, 8))
    let leftTrainers = [];
    let rightTrainers = [];
  
    let index = 0
    for (let [tkey,value] of remainingTrainers) {
        value.mons[value.starter].currHP = 1
        let tImgURL='./chars/ppl/'+ value.name.toLowerCase()+'.png'
        let mImgURL='./chars/mons/'+ value.starter.toLowerCase()+'.png'

        index < remainingTrainers.length /2 ?
        leftTrainers.push(<div className='flexRow'>
                            <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={tImgURL}></img>{value.name}</div>
                            <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={mImgURL}></img>{value.mons[value.starter].currHP} / {value.mons[value.starter].hp}</div>
                          </div>) :
        rightTrainers.push(<div className='flexRow'>
                            <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={mImgURL}></img>{value.mons[value.starter].currHP} / {value.mons[value.starter].hp}</div>
                            <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={tImgURL}></img>{value.name}</div>
                           </div>)
        index++
    }

    return (
    <div>
        <div className="Fight-header">
            <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>
        <div
        className='flexRow'
        style={{justifyContent:"space-between",marginLeft:"10vw",marginRight:"10vw",height:"75vh"}}>
            <div className='flexCol'
            style={{justifyContent:"space-between"}}>
                {leftTrainers}
            </div>
            <div className='flexCol'
            style={{justifyContent:"space-between"}}>
                {rightTrainers}
            </div>
        </div>
    </div>
    )
}

export default Fight