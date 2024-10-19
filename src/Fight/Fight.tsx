import React, { useState, useEffect, useRef } from 'react'
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
    const firstRender = useRef(true);
    const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0]))
                                                                        .filter((t) => t[1].state == "Unlocked"))
                                                                        .sort(() => 0.5 - Math.random()))
                                                                        .slice(0, 8)))
    const [activeTrainer, setActiveTrainer] = useState(Object.keys(currTrainers)[0])
    const [fullCards, setFullCards] = useState(combineLists)
    if (firstRender.current) {firstRender.current = false;}

    function combineLists(): JSX.Element {
        return (
         <div
          className='flexRow'
          style={{justifyContent:"space-between",marginLeft:"10vw",marginRight:"10vw",height:"75vh"}}>
             <div className='flexCol'
             style={{justifyContent:"space-between"}}>
                 {setTrainerCards(true)}
             </div>
             <div className='flexCol'
             style={{justifyContent:"space-between"}}>
                 {setTrainerCards(false)}
             </div>
         </div>)
     }

    function setTrainerCards(left: boolean): JSX.Element[] {
        let trainers: JSX.Element[] = [];
        let index = 0
        console.log(Object.keys(currTrainers))
        
        
        for (const tKey in currTrainers) {
            if ((left && index < Object.keys(currTrainers).length / 2) || (!left && index > Object.keys(currTrainers).length / 2 - 1)) {
                console.log(tKey)
                if (firstRender.current) {currTrainers[tKey].mons[currTrainers[tKey].starter].currHP = currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                let tImgURL='./chars/ppl/'+ currTrainers[tKey].name.toLowerCase()+'.png'
                let mImgURL='./chars/mons/'+ currTrainers[tKey].starter.toLowerCase()+'.png'
        
                trainers.push(<div key={Math.random()} className='flexRow' style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}} onClick={() => {hp(tKey,2);setFullCards(combineLists)}}>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}>
                                        <img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
                                        / 
                                        {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                                    </div>
                                </div>)
            console.log("-----------------------------")
            }
            index++
        }

        return trainers
    }

    function hp(trainer: string, diff: number) {
       let result = currTrainers[trainer].mons[currTrainers[trainer].starter].currHP - diff
       result < 0 ? 
        result = 0 : 
        result > currTrainers[trainer].mons[currTrainers[trainer].starter].hp ? 
            result = currTrainers[trainer].mons[currTrainers[trainer].starter].hp :
            result = result
       let tmp = currTrainers
       tmp[trainer].mons[tmp[trainer].starter].currHP = result;
       setCurrTrainers(tmp)
    }

    return (
    <div>
        <div className="Fight-header">
            <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>
        {fullCards}
    </div>
    )
}

export default Fight