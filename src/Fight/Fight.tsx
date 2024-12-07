import React, { useState, useEffect, useRef } from 'react'
import './Fight.css'
import FileSaver from 'file-saver';
import { Tooltip } from 'react-tooltip';

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
starterForm: string; //The active starting mon's form
region: string; //Home region of this trainer. (Used primarily for sorting)
class: string; //This trainer's class. (Used primarily for sorting)
w: number; //Total number of tourney wins for this trainer
l: number; //Total number of tourney losses for this trainer
BP: number; //Available BP for this trainer (Game Currency)
mons: any //Object containing all mon data for this trainer
};

let toRender = false //Flag to force a re-render

let dex: any = {}
fetch('/dex.json').then(response => {return response.json()}).then(tmp => dex = tmp)
//Returns the content of the Fight Menu
function Fight({menu, trainers}: Fight) {
    const [isLoading, setIsLoading] = useState(true); //Loading state to prevent errors while data is being generated.
    const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0])) //Filtered duplicate of trainer data modified to indicate the modifiable nature of this menu and onlly include 8 random selections
                                                                        .filter((t) => t[1].state == "Unlocked"))
                                                                        .sort(() => 0.5 - Math.random()))
                                                                        .slice(0, 8)))
    const [activeTrainers, setActiveTrainers] = useState<string[]>(shuffleArray(Object.keys(currTrainers))) //Array of Keys of the trainers still able to fight
    const [fullCards, setFullCards] = useState(combineLists) //The content to render

    const types: any = { //List of all possible types a mon can have. Used both for display and effectiveness calculator
        "Bug": ["Grass","Psychic","Dark"],
        "Dark": ["Psychic","Ghost"],
        "Dragon": ["Dragon"],
        "Electric": ["Water","Flying"],
        "Fairy": ["Fighting","Dragon","Dark"],
        "Fighting": ["Normal","Ice","Rock","Dark","Steel"],
        "Fire": ["Grass","Ice","Bug","Steel"],
        "Flying": ["Grass","Fighting","Bug"],
        "Ghost": ["Psychic","Ghost"],
        "Grass": ["Water","Ground","Rock"],
        "Ground": ["Fire","Electric","Poison","Rock","Steel"],
        "Ice": ["Grass","Ground","Flying","Ice"],
        "Normal": ["Null"],
        "Null": ["Normal"],
        "Poison": ["Grass","Fairy"],
        "Psychic": ["Fighting","Poison"],
        "Rock": ["Fire","Ice","Flying","Bug"],
        "Steel": ["Ice","Rock","Steel"],
        "Water": ["Fire","Ground","Rock"]
    };

    //Initial data loading
    if (isLoading){
        let result: any = {}

        Promise.all(Object.keys(currTrainers).map((key) => {
            return new Promise((resolve) => {
                fetch('/Savedata/'+key+'.json')
                .then((response) => {resolve(response.json())})});
        }))
        .then((values) => {values.map((y: any) => {result[y.name] = y})})
        .then(() => {
            toRender = true
            setCurrTrainers(result)
            setIsLoading(false);
        });
    }
    //This useEffect is set to re-render manually when the trigger is set to true
    //Also functions as a primary debugging function for seeing the most up to date changes
    useEffect(() => {
        //console.log("Active Trainers: ")
        //console.log(activeTrainers)

        if (toRender) {
            setFullCards(combineLists)
            toRender = false
        }
    });
    
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
            <div key={Math.random()} className='flexRow'
                style={{justifyContent:"space-between",marginLeft:"10vw",marginRight:"10vw",height:"75vh"}}>
                <div className='flexCol' style={{justifyContent:"space-between"}}>
                    {setTrainerCards(true)}
                </div>
                <div>
                    {activeTrainers.length <= 1 ? 
                    <>
                        <div className='flexCol active'>
                            <img src={'./chars/ppl/'+ currTrainers[activeTrainers[0]].name+'.png'} />
                            {currTrainers[activeTrainers[0]].name} is victorius!
                        </div>
                        <button 
                            onClick={() => {
                                menu[1]("Main-Menu")
                                let i = 1
                                Object.keys(currTrainers).forEach((trainer: any) => {
                                    const timeoutId = window.setTimeout(() => {
                                        let tmp = currTrainers[trainer]
                                        tmp.mons[tmp.starter].currHP = undefined
                                        const blob = new Blob([JSON.stringify(tmp)], { type: 'application/json' });
                                        FileSaver.saveAs(blob, trainer +".json");
                                    }, 500*i)
                                    i++
                        })}}>
                            Back Main Menu
                        </button>
                    </>:
                    <></>
                    }
                </div>
                <div className='flexCol' style={{justifyContent:"space-between"}}>
                    {setTrainerCards(false)}
                </div>
            </div>
        )
     }

    //Creates a list of trainers, enabling different visuals and functions depending on the trainer's current fight state
    function setTrainerCards(left: boolean): JSX.Element[] {
        let trainers: JSX.Element[] = []; //Placeholder to add to contet. Will be the return value.
        let index = 0 //For determining the hallf way point to split the content in the middle while still generating correctly and using the same function
        
        //For each trainer in play, determine which action to apply to the card based on turn and status
        for (const tKey in currTrainers) {
            let loopTrainer = currTrainers[tKey] //Shorthand variable for the trainer being handled by each loop
            let loopActiveMon = loopTrainer.mons[loopTrainer.starter] //Shorthand variable for the trainer's active mon
            try {
                //Loop through each trainer in the current trainers list and Create a fight card for them .
                if ((left && index < Object.keys(currTrainers).length / 2) || (!left && index > Object.keys(currTrainers).length / 2 - 1)) {
                    if (loopActiveMon.currHP == undefined) {loopActiveMon.currHP = loopActiveMon.hp} // Set the trainer's currHP if they do not have that variable
                    let tImgURL='./chars/ppl/'+ loopTrainer.name+'.png' //Shorthand variable for the trainer img
                    //Calulate the shorthand variable for the mon img
                    let imgURLPrefix = './chars/mons/'+ loopActiveMon.name, imgURLForm = "", imgURLShine = "" 
                    if (loopActiveMon.form != "") {imgURLForm = ' '+loopActiveMon.form}
                    if (loopActiveMon.shine == "Shiny") {imgURLShine = ' (Shiny)'}
                    let mImgURL=imgURLPrefix+imgURLForm+imgURLShine+'.png'

                    //Calculate the shorthand variables for the items that are different depending card conditions: css tag, onclick ffunction, mon tooltip
                    let loopActiveMonQueueState = 'alive', loopActiveMonOnClick = () =>{}, loopActiveMonEffectiveness = <></>
                    if (tKey == activeTrainers[0]) { //The trainer who's turn it is
                        loopActiveMonQueueState = 'active'
                    }
                    else if (loopActiveMon.currHP <= 0) {//Trainer who is defeated and is no loger in the queue
                        loopActiveMonQueueState = 'defeated'
                        loopActiveMonEffectiveness = effective(dex.mons[currTrainers[activeTrainers[0]].starter].type1,dex.mons[currTrainers[activeTrainers[0]].starter].type2,dex.mons[loopTrainer.starter].type1,dex.mons[loopTrainer.starter].type2) > 1 ? <div className='active circle'></div> : <></>
                    }
                    else { //Trainer who is still in the tourney, but it is not their turn
                        loopActiveMonOnClick = () => {act(tKey)}
                        loopActiveMonEffectiveness = effective(dex.mons[currTrainers[activeTrainers[0]].starter].type1,dex.mons[currTrainers[activeTrainers[0]].starter].type2,dex.mons[loopTrainer.starter].type1,dex.mons[loopTrainer.starter].type2) > 1 ? <div className='active circle'></div> : <></>
                        }


                    trainers.push(
                        <div className='flexRow fightCard' style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}} onClick={loopActiveMonOnClick}>
                            <div className={'flexCol ' + loopActiveMonQueueState}><img src={tImgURL}></img>{loopTrainer.name}</div>
                                <Tooltip anchorSelect={"#"+loopTrainer.name.replace(/\s+/g, '')}>
                                    <div className='flexCol'>
                                        {loopActiveMon.name}
                                        <div className='flexRow'>
                                            <img src={"/icons/"+dex.mons[loopActiveMon.name + loopActiveMon.form].type1 + ".png"} className='typeImg'/>
                                            {dex.mons[loopActiveMon.name +loopActiveMon.form].type2 != "" ? <img src={"/icons/"+dex.mons[loopActiveMon.name + loopActiveMon.form].type2 + ".png"} className='typeImg'/>:<></>}
                                            {loopActiveMonEffectiveness}
                                        </div>
                                    </div>
                                </Tooltip>
                                <div id={loopTrainer.name.replace(/\s+/g, '')} className={'flexCol ' + loopActiveMonQueueState}>
                                    <img src={mImgURL}></img>L{loopActiveMon.lvl}: {loopActiveMon.currHP}
                                    / 
                                    {loopActiveMon.hp}
                                </div>
                                </div>)
                    
                }
            }
            catch {
                if (!isLoading) console.log("There was an error loading "+tKey+". They have no mon assigned to them under the key "+loopTrainer.starter)
            }
            index++
        }
        return trainers
    }

    //Processes the action a trainer can take when it is their turn as well as the consequences
    function act(target: string) {
        //Multipurpose value which contains both modified tData [0] & whether the attack resullted in a defeat or not [1]
        let tData = hp(currTrainers,target,currTrainers[activeTrainers[0]].mons[currTrainers[activeTrainers[0]].starter])
        let remainingKeys = activeTrainers.filter((tKey) => tKey != activeTrainers[0])
        
        //If target was defeated, set for removal from turn queue
        if (tData[1]) {
            remainingKeys = remainingKeys.filter((tKey) => tKey != target)
        }
        if (remainingKeys.length <= 2) {
            remainingKeys = shuffleArray(Object.keys(currTrainers).filter((tKey) => currTrainers[tKey].mons[currTrainers[tKey].starter].currHP > 0))
            if (remainingKeys.length == 1) {
                tData[0] = win(tData[0], activeTrainers[0])
            }            
        }
        setCurrTrainers(tData[0]) //update tData
        toRender = true
        setActiveTrainers(remainingKeys)
    }

    function effective(attackerType1: string, attackerType2: string, defenderType1: string, defenderType2: string): number {
        if (types[attackerType1].includes(defenderType1)) {console.log("Super Effective");return 2}
        else if (types[attackerType1].includes(defenderType2)) {console.log("Super Effective");return 2}
        else if (types[attackerType2] != undefined && types[attackerType2] != "") {
            if (types[attackerType2].includes(defenderType1)) {console.log("Super Effective");return 2}
            else if (types[attackerType2].includes(defenderType2)) {console.log("Super Effective");return 2}
        }
        return 1
    }
    
    //Cause a target to lose some of their current HP
    function hp(tData: any, trainer: string, diff: any) {
        let dmgMultiplier = 1
        let attackerType1 = dex.mons[diff.name + diff.form].type1
        let attackerType2 = "noType"
        if (dex.mons[diff.name + diff.form].type2 != undefined && dex.mons[diff.name + diff.form].type2 != "") {attackerType2 = dex.mons[diff.name + diff.form].type2}
        let defenderType1 = dex.mons[tData[trainer].starter].type1
        let defenderType2 = "noType"
        if (dex.mons[tData[trainer].starter].type2 != undefined && dex.mons[tData[trainer].starter].type2 != "") {defenderType2 = dex.mons[tData[trainer].starter].type2}

        dmgMultiplier = dmgMultiplier * effective(attackerType1,attackerType2,defenderType1,defenderType2)

       let result = tData[trainer].mons[tData[trainer].starter].currHP - (diff.lvl * dmgMultiplier) //Calculates loss of HP
       console.log("Attack dealt " +diff.lvl * dmgMultiplier+ "dmg")
       // HP would go out of bounds, bring it back to the edge of bounds
       if (result <= 0) {result = 0}
       else if (result > tData[trainer].mons[tData[trainer].starter].hp) { 
            result = tData[trainer].mons[tData[trainer].starter].hp
       }
       // Set current hp to calculated result
       tData[trainer].mons[tData[trainer].starter].currHP = result

       //If target is defeated, give the attacker xp and the target an hp buff
       if (result == 0) {
        tData[trainer].mons[tData[trainer].starter].hp = tData[trainer].mons[tData[trainer].starter].hp + 1
        tData = xp(tData,activeTrainers[0],tData[trainer].mons[tData[trainer].starter].lvl)
        return [tData,true]
       }
       else {return [tData,false]}
    }

    //Causes mon to gain xp and levelup if threshod is met
    function xp(tData: any, trainer: string, diff: number) {
        let result = currTrainers[trainer].mons[currTrainers[trainer].starter].xp + diff //Calculates XP gained
        let lvlUp = false //Assumed levelup threshold not met unless otherwise specified below
        result >= currTrainers[trainer].mons[currTrainers[trainer].starter].lvl ? lvlUp = true : lvlUp = false
        //If mon should level up, increase the, taking off the amount that would level them up once and increment their level
        if (lvlUp) {
            tData[trainer].mons[tData[trainer].starter].xp = result - currTrainers[trainer].mons[currTrainers[trainer].starter].lvl
            tData[trainer].mons[tData[trainer].starter].lvl = tData[trainer].mons[tData[trainer].starter].lvl + 1
            if (tData[trainer].mons[tData[trainer].starter].lvl >= 2) {
                for (const mKey in tData[trainer].mons) {
                    if (tData[trainer].mons[mKey].shine == "" && (dex.mons[tData[trainer].mons[mKey].name + tData[trainer].mons[mKey].form].unlocker) == tData[trainer].starter) {
                        tData[trainer].mons[mKey].state = "Available"
                    }
                    else if (tData[trainer].mons[mKey].shine == "Shiny" && 
                                (tData[trainer].mons[mKey].name + tData[trainer].mons[mKey].form) == tData[trainer].starter) 
                            {tData[trainer].mons[mKey].state = "Available"}
                }
            }
        }
        else {
            tData[trainer].mons[tData[trainer].starter].xp = diff
        }
        //If trainer can level up again, do so recursively until fully leveled up
        result >= currTrainers[trainer].mons[currTrainers[trainer].starter].lvl ? tData = xp(tData,trainer,0) : lvlUp = false
        return tData // Returned modified data
     }

     function win(tdata: any, trainer: string) {
        tdata[trainer].BP = tdata[trainer].BP + 1
        tdata[trainer].w = tdata[trainer].w + 1
        return tdata
     }

    return (
    <div>
        <div className="Fight-header">
            <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>
        {isLoading ? (
        <p>Loading...</p> 
         ) : (fullCards)}
    </div>
    )
}

export default Fight