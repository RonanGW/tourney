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
    const [fullCards, setFullCards] = useState(combineLists(true))
    // const [rightTrainers, setRightTrainers] = useState([])
    // let tmpleftTrainers = [];
    // let tmprightTrainers = [];
    // let evenIndex = true
    
    // for (const tKey in currTrainers) {
    //     currTrainers[tKey].mons[currTrainers[tKey].starter].currHP = currTrainers[tKey].mons[currTrainers[tKey].starter].hp
    //     let tImgURL='./chars/ppl/'+ currTrainers[tKey].name.toLowerCase()+'.png'
    //     let mImgURL='./chars/mons/'+ currTrainers[tKey].starter.toLowerCase()+'.png'

    //     evenIndex ?
    //     tmpleftTrainers.push(<div className='flexRow' onClick={() => {hp(tKey,2)}}>
    //                         <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
    //                         <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}>
    //                             <img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
    //                              / 
    //                             {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
    //                         </div>
    //                       </div>) :
    //     tmprightTrainers.push(<div className='flexRow'>
    //                         <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={mImgURL}>
    //                             </img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
    //                              / 
    //                             {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
    //                         </div>
    //                         <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
    //                        </div>)
    //     evenIndex ? evenIndex = false : evenIndex = true
    // }

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

    function combineLists(start: boolean): JSX.Element {
        return (
         <div
          className='flexRow'
          style={{justifyContent:"space-between",marginLeft:"10vw",marginRight:"10vw",height:"75vh"}}>
             <div className='flexCol'
             style={{justifyContent:"space-between"}}>
                 {setTrainerCards(start, true)}
             </div>
             <div className='flexCol'
             style={{justifyContent:"space-between"}}>
                 {setTrainerCards(start, false)}
             </div>
         </div>)
     }

    function setTrainerCards(start: boolean, left: boolean): JSX.Element[] {
        let trainers: JSX.Element[] = [];
        let index = 0
        console.log(Object.keys(currTrainers))
        
        
        for (const tKey in currTrainers) {
            console.log(tKey)
            if ((left && index < Object.keys(currTrainers).length / 2) || (!left && index > Object.keys(currTrainers).length / 2 - 1)) {
                //console.log(tKey)
                //console.log(currTrainers[tKey].mons[currTrainers[tKey].starter].currHP)
                if (start) {currTrainers[tKey].mons[currTrainers[tKey].starter].currHP = currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                //console.log(currTrainers[tKey].mons[currTrainers[tKey].starter].currHP)
                let tImgURL='./chars/ppl/'+ currTrainers[tKey].name.toLowerCase()+'.png'
                let mImgURL='./chars/mons/'+ currTrainers[tKey].starter.toLowerCase()+'.png'
                console.log(tImgURL)
        
                trainers.push(<div key={Math.random()} className='flexRow' style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}} onClick={() => {hp(tKey,2);setFullCards(combineLists(false))}}>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:tKey == activeTrainer ? "green":"blue"}}>
                                        <img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
                                        / 
                                        {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                                    </div>
                                </div>)
            console.log("-----------------------------")
            }
            else {
                console.log("Not Pushed")
                console.log("-----------------------------")
            }
            index++
            //style={{display: "flex", flexDirection: index > Object.keys(currTrainers).length / 2 ? "row-reverse" : "row"}}
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
       //console.log("tmp["+trainer+"].mons["+tmp[trainer].starter+"].currHP")
       //console.log(tmp[trainer].mons[tmp[trainer].starter].currHP)
       //tmp[trainer].mons[tmp[trainer].starter].currHP = result
       tmp[trainer].mons[tmp[trainer].starter].currHP = 5;
      // console.log(tmp[trainer].mons[tmp[trainer].starter].currHP)
       //console.log(tmp)
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