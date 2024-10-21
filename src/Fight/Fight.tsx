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


let toRender = false

function Fight({menu, trainers}: Fight) {
    const firstRender = useRef(true);
    const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0]))
                                                                        .filter((t) => t[1].state == "Unlocked"))
                                                                        .sort(() => 0.5 - Math.random()))
                                                                        .slice(0, 8)))
    const [activeTrainers, setActiveTrainers] = useState<string[]>(shuffleArray(Object.keys(currTrainers)))
    const [fullCards, setFullCards] = useState(combineLists)

    useEffect(() => {
        // Update the document title using the browser API
        console.log("Active Trainers: ")
        console.log(activeTrainers)

        if (toRender) {
            setFullCards(combineLists)
            toRender = false
        }
      });

    if (firstRender.current) {firstRender.current = false;}

    function shuffleArray(array: string[]) {
        for (var i = array.length - 1; i >= 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }

    function combineLists(): JSX.Element {
        return (
         <div key={Math.random()}
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
        
        
        for (const tKey in currTrainers) {
            if ((left && index < Object.keys(currTrainers).length / 2) || (!left && index > Object.keys(currTrainers).length / 2 - 1)) {
                if (firstRender.current) {currTrainers[tKey].mons[currTrainers[tKey].starter].currHP = currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                let tImgURL='./chars/ppl/'+ currTrainers[tKey].name.toLowerCase()+'.png'
                let mImgURL='./chars/mons/'+ currTrainers[tKey].starter.toLowerCase()+'.png'
        
                if (tKey == activeTrainers[0]) {
                    trainers.push(<div className='flexRow' style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}}>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:"green"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:"green"}}>
                                        <img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
                                        / 
                                        {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                                    </div>
                                </div>)
                }
                else if (currTrainers[tKey].mons[currTrainers[tKey].starter].currHP <= 0) {
                    trainers.push(<div className='flexRow' style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}}>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:"red"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                                    <div className='flexCol' style={{width:"128px",backgroundColor:"red"}}>
                                        <img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
                                        / 
                                        {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                                    </div>
                                </div>)
                }
                else {
                    trainers.push(
                    <div className='flexRow' style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}} onClick={() => {act(tKey)}}>
                        <div className='flexCol' style={{width:"128px",backgroundColor:"blue"}}><img src={tImgURL}></img>{currTrainers[tKey].name}</div>
                        <div className='flexCol' style={{width:"128px",backgroundColor:"blue"}}>
                            <img src={mImgURL}></img>{currTrainers[tKey].mons[currTrainers[tKey].starter].currHP}
                            / 
                            {currTrainers[tKey].mons[currTrainers[tKey].starter].hp}
                    </div>
                </div>)
                }
            }
            index++
        }
        return trainers
    }

    function removeTrainers(trainersToRemove: string[]) {
        toRender = true
        setActiveTrainers([...activeTrainers].filter((tKey) => !trainersToRemove.includes(tKey)))//splice(tmp.indexOf(tmp[0]), 1))
    }

    function act(target: string) {
        let defeat = hp(target,currTrainers[activeTrainers[0]].mons[currTrainers[activeTrainers[0]].starter].lvl) //currTrainers[activeTrainers[0]].mons[currTrainers[activeTrainers[0]].starter].lvl
        let removals = [activeTrainers[0]]
        if (defeat) {
            removals.push(target)
        }
        if (activeTrainers.length > 2) {
           removeTrainers(removals)
        }
        else if (activeTrainers.length <= 2) {
            console.log("ROUND COMPLETE!!!")
            toRender = true
            setActiveTrainers([...shuffleArray(Object.keys(currTrainers).filter((tKey) => currTrainers[tKey].mons[currTrainers[tKey].starter].currHP > 0))])            
        }
    }

    function hp(trainer: string, diff: number) {
       let result = currTrainers[trainer].mons[currTrainers[trainer].starter].currHP - diff
       if (result <= 0) {result = 0}
       else if (result > currTrainers[trainer].mons[currTrainers[trainer].starter].hp) { 
            result = currTrainers[trainer].mons[currTrainers[trainer].starter].hp
       }
        
       let tmp = currTrainers
       tmp[trainer].mons[tmp[trainer].starter].currHP = result
       setCurrTrainers(tmp)

       if (activeTrainers.includes(trainer) && result == 0) {
        console.log(activeTrainers[0] + " defeated "+trainer+"!")
        return true
       }
       else {return false}
    }

    function xp(trainer: string, diff: number) {
        let result = currTrainers[trainer].mons[currTrainers[trainer].starter].xp + diff
        let lvlUp = false
        result >= currTrainers[trainer].mons[currTrainers[trainer].starter].lvl ? lvlUp = true : lvlUp = false
        let tmp = currTrainers
        if (lvlUp) {
            tmp[trainer].mons[tmp[trainer].starter].xp = result - currTrainers[trainer].mons[currTrainers[trainer].starter].lvl
            tmp[trainer].mons[tmp[trainer].starter].lvl = tmp[trainer].mons[tmp[trainer].starter].lvl + 1
        }
        else {
            tmp[trainer].mons[tmp[trainer].starter].xp = diff
        }
        //console.log("XP function called.\n"+trainer+"\nnew lvl:"+tmp[trainer].mons[tmp[trainer].starter].lvl+"\nnew xp:"+tmp[trainer].mons[tmp[trainer].starter].xp)
        setCurrTrainers(tmp)
        result >= currTrainers[trainer].mons[currTrainers[trainer].starter].lvl ? xp(trainer,0) : lvlUp = false
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