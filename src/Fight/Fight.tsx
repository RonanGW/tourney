import React, { useState, useEffect, useRef } from 'react'
import './Fight.css'

//Interface to pass state variables created by parent object
interface Fight {
    menu: any[] // passes the current state (i.e. gallery menu) to this page so it can be undone. Value is [state<string>,setState()]
    trainers: any[] // Current trainer data for populating most up to date character info. Value is [state<trainer>,setState()]
}

// Generic data structure for a 'mon'
interface mon {
    name: string, //The mon's name
    form: string, //The mon's from ("" if none)
    shine:string, //The mon's shine ("" if none)
    state: string; //The state of this mon for this trainer, (i.e. Unlocked, Locked or Hidden)
    lvl: number; //The mon's current level
    xp: number; //The mon's current xp prior to leveling. (Cap is their current level which will let them level up)
    hp: number; //The mon's current total HP
    currHP: number; //The mon's current remaining HP
    atk: number; //Unused for now. Currently damage is just equal to mon's level
    cost: number; //How many BP it costs to purchase this mon once it goes from 'hidden' to 'locked'
  }

  // Generic data structure for a 'trainer'
  interface trainer {
    name: string; //The display name of the trainer
    state: string; //The state of this trainer, (i.e. Unlocked, Locked or Hidden)
    starter: string; //The active starting mon of the trainer
    region: string; //Home region of this trainer. (Used primarily for sorting)
    class: string; //This trainer's class. (Used primarily for sorting)
    w: number; //Total number of tourney wins for this trainer
    l: number; //Total number of tourney losses for this trainer
    BP: number; //Available BP for this trainer (Game Currency)
    mons: any //Object containing all mon data for this trainer
  };


let toRender = false //Representation of current render

//Returns the content of the Fight Menu
function Fight({menu, trainers}: Fight) {
    const firstRender = useRef(true) ///To distinguish the first render
    const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0])) //Filtered duplicate of trainer data modified to indicate the modifiable nature of this menu and onlly include 8 random selections
                                                                        .filter((t) => t[1].state == "Unlocked"))
                                                                        .sort(() => 0.5 - Math.random()))
                                                                        .slice(0, 8)))
    const [activeTrainers, setActiveTrainers] = useState<string[]>(shuffleArray(Object.keys(currTrainers))) //Array of Keys of the trainers still able to fight
    const [fullCards, setFullCards] = useState(combineLists) //The content to render

    //This useEffect is set to re-render manually when the trigger is set to true
    //Also functions as a primary debugging function for seeing the most up to date changes
    useEffect(() => {
        // Update the document title using the browser API
        console.log("Active Trainers: ")
        console.log(activeTrainers)

        if (toRender) {
            setFullCards(combineLists)
            toRender = false
        }
      });

    if (firstRender.current) {firstRender.current = false;} //If the is the first render, log this.
    
    //Shuffle an array of strings in a random order
    function shuffleArray(array: string[]) {
        for (var i = array.length - 1; i >= 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }

    //Generate the content to be displayed in the Fight menu
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

    //Creates a list of trainers, enabling different visuals and functions depending on the trainer's current fight state
    function setTrainerCards(left: boolean): JSX.Element[] {
        let trainers: JSX.Element[] = []; //Placeholder to add to contet. Will be the return value.
        let index = 0 //For determining the hallf way point to split the content in the middle while still generating correctly and using the same function
        
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

    function editTData(tData: object) {

    }

    // Re-renders display by removing the passed trainers from the active trainers list
    function removeTrainers(trainersToRemove: string[]) {
        toRender = true // Forces Render
        setActiveTrainers([...activeTrainers].filter((tKey) => !trainersToRemove.includes(tKey)))
    }

    function act(target: string) {
       let tmp = currTrainers
        let defeat = hp(currTrainers,target,currTrainers[activeTrainers[0]].mons[currTrainers[activeTrainers[0]].starter].lvl) //currTrainers[activeTrainers[0]].mons[currTrainers[activeTrainers[0]].starter].lvl
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

        editTData(tmp)
    }

    function hp(tData: object, trainer: string, diff: number) {
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
        xp(tData,activeTrainers[0],1)
        return true
       }
       else {return false}
    }

    function xp(tData: object, trainer: string, diff: number) {
        let result = currTrainers[trainer].mons[currTrainers[trainer].starter].xp + diff
        let lvlUp = false
        result >= currTrainers[trainer].mons[currTrainers[trainer].starter].lvl ? lvlUp = true : lvlUp = false
        let tmp = currTrainers
        if (lvlUp) {
            console.log(activeTrainers[0] + "should level up")
            tmp[trainer].mons[tmp[trainer].starter].xp = result - currTrainers[trainer].mons[currTrainers[trainer].starter].lvl
            tmp[trainer].mons[tmp[trainer].starter].lvl = tmp[trainer].mons[tmp[trainer].starter].lvl + 1
        }
        else {
            tmp[trainer].mons[tmp[trainer].starter].xp = diff
        }
        //console.log("XP function called.\n"+trainer+"\nnew lvl:"+tmp[trainer].mons[tmp[trainer].starter].lvl+"\nnew xp:"+tmp[trainer].mons[tmp[trainer].starter].xp)
        setCurrTrainers(tmp)
        result >= currTrainers[trainer].mons[currTrainers[trainer].starter].lvl ? xp(tData,trainer,0) : lvlUp = false
        
        console.log(activeTrainers[0] + "gained xp")
        return tData
     }

     function win(tdata: object, trainer: trainer) {
        return tdata
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