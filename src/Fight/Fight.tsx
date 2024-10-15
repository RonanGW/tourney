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
    const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0]))
                                                                        .filter((t) => t[1].state == "Unlocked"))
                                                                        .sort(() => 0.5 - Math.random()))
                                                                        .slice(0, 8)))
    const [activeTrainer, setActiveTrainer] = useState(Object.keys(currTrainers)[0])
    let leftTrainers = [];
    let rightTrainers = [];
  
    let evenIndex = true
    for (const tKey in currTrainers) {
        currTrainers[tKey].mons[currTrainers[tKey].starter].currHP = 1
        let tImgURL='./chars/ppl/'+ currTrainers[tKey].name.toLowerCase()+'.png'
        let mImgURL='./chars/mons/'+ currTrainers[tKey].starter.toLowerCase()+'.png'

        evenIndex ?
        leftTrainers.push(<div className='flexRow'>
                            <div className='flexCol' style={{backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                            <div className='flexCol' style={{backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP} / {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}</div>
                          </div>) :
        rightTrainers.push(<div className='flexRow'>
                            <div className='flexCol' style={{backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP} / {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}</div>
                            <div className='flexCol' style={{backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                           </div>)
        evenIndex ? evenIndex = false : evenIndex = true
    }

    // for (let [tkey,value] of remainingTrainers) {
    //     value.mons[value.starter].currHP = 1
    //     let tImgURL='./chars/ppl/'+ value.name.toLowerCase()+'.png'
    //     let mImgURL='./chars/mons/'+ value.starter.toLowerCase()+'.png'

    //     index < remainingTrainers.length /2 ?
    //     leftTrainers.push(<div className='flexRow'>
    //                         <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={tImgURL}></img>{value.name}</div>
    //                         <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={mImgURL}></img>{value.mons[value.starter].currHP} / {value.mons[value.starter].hp}</div>
    //                       </div>) :
    //     rightTrainers.push(<div className='flexRow'>
    //                         <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={mImgURL}></img>{value.mons[value.starter].currHP} / {value.mons[value.starter].hp}</div>
    //                         <div className='flexCol' style={{backgroundColor:index == 0 ? "green":"blue"}}><img src={tImgURL}></img>{value.name}</div>
    //                        </div>)
    //     index++
    // }

    function hp(trainer: string, diff: number) {
       let result = currTrainers[trainer].mons[currTrainers[trainer].starter].currHP - diff
       result < 0 ? 
        result = 0 : 
        result > currTrainers[trainer].mons[currTrainers[trainer].starter].hp  ? 
            result = currTrainers[trainer].mons[currTrainers[trainer].starter].hp :
            result = result
       let tmp = currTrainers
       tmp[trainer].mons[currTrainers[trainer].starter].currHP = result
       setCurrTrainers(tmp)
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