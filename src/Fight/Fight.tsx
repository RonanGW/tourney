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
team: string[];
starterForm: string; //The active starting mon's form
attacker: number;
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
        "Water": ["Fire","Ground","Rock"],
        "Bug-R": ["Grass","Fighting","Ground"],
        "Dark-R": ["Psychic","Ghost","Dark"],
        "Dragon-R": ["Fire","Water","Grass","Electric"],
        "Electric-R": ["Electric","Flying","Steel"],
        "Fairy-R": ["Fighting","Bug","Dragon","Dark"],
        "Fighting-R": ["Bug","Rock","Dark"],
        "Fire-R": ["Fire","Grass","Ice","Bug","Steel","Fairy"],
        "Flying-R": ["Grass","Fighting","Ground","Bug"],
        "Ghost-R": ["Normal","Fighting","Poison","Bug"],
        "Grass-R": ["Water","Grass","Electric","Ground"],
        "Ground-R": ["Electric","Poison","Rock"],
        "Ice-R": ["Ice"],
        "Normal-R": ["Ghost"],
        "Null-R": ["Pyschic"],
        "Poison-R": ["Grass","Fighting","Poison","Bug","Fairy"],
        "Psychic-R": ["Fighting","Pyschic"],
        "Rock-R": ["Normal","Fire","Poison","Flying"],
        "Steel-R": ["Normal","Grass","Ice","Flying","Psychic","Bug","Rock","Dragon","Steel","Fairy"],
        "Water-R": ["Fire","Water","Ice","Steel"]
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
            console.log(currTrainers)
            setFullCards(combineLists)
            toRender = false
        }
    });
    
    //Shuffle an array of strings in a random order
    function shuffleArray(array: string[]) {
        //console.log(array)
        for (var i = array.length - 1; i >= 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        //console.log(array)
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
                            <p>{currTrainers[activeTrainers[0]].name} is victorius!</p>
                        </div>
                        <button 
                            onClick={() => {
                                menu[1]("Main-Menu")
                                let i = 1
                                Object.keys(currTrainers).forEach((trainer: any) => {
                                    const timeoutId = window.setTimeout(() => {
                                        let tmp = currTrainers[trainer]
                                        tmp.mons[tmp.team[0]].currHP = undefined
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
            try {
                if (currTrainers[tKey].attacker == undefined) {currTrainers[tKey].attacker = 0} // Set the trainer's currHP if they do not have that variable
                let loopTrainer = currTrainers[tKey] //Shorthand variable for the trainer being handled by each loop
                let loopActiveMon = loopTrainer.mons[loopTrainer.team[loopTrainer.attacker]] //Shorthand variable for the trainer's active mon
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
                        loopActiveMonEffectiveness = effective(dex.mons[currTrainers[activeTrainers[0]].team[0]].type1,dex.mons[currTrainers[activeTrainers[0]].team[0]].type2,dex.mons[loopTrainer.team[0]].type1,dex.mons[loopTrainer.team[0]].type2) > 1 ? <div className='active circle'></div> : effective(dex.mons[currTrainers[activeTrainers[0]].team[0]].type1,dex.mons[currTrainers[activeTrainers[0]].team[0]].type2,dex.mons[loopTrainer.team[0]].type1,dex.mons[loopTrainer.team[0]].type2) < 1 ? <div className='defeated circle'></div> : <></>
                    }
                    else { //Trainer who is still in the tourney, but it is not their turn
                        loopActiveMonOnClick = () => {act(tKey)}
                        loopActiveMonEffectiveness = effective(dex.mons[currTrainers[activeTrainers[0]].team[0]].type1,dex.mons[currTrainers[activeTrainers[0]].team[0]].type2,dex.mons[loopTrainer.team[0]].type1,dex.mons[loopTrainer.team[0]].type2) > 1 ? <div className='active circle'></div> : effective(dex.mons[currTrainers[activeTrainers[0]].team[0]].type1,dex.mons[currTrainers[activeTrainers[0]].team[0]].type2,dex.mons[loopTrainer.team[0]].type1,dex.mons[loopTrainer.team[0]].type2) < 1 ? <div className='defeated circle'></div> : <></>
                    }


                    trainers.push(
                        <div className={'flexRow trainerBlock'} style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}}>
                        <div id={loopTrainer.name.replace(/\s+/g, '')} className={"monQueue " + loopActiveMonQueueState + (left ? " fightCard-left" : " fightCard-right")}>
                            <div className='flexCol' style={{width:"100%",display:"flex",alignItems:"center"}}>
                                <div className='flexRow'>
                                    <img src={mImgURL}/>
                                {currTrainers[tKey].team[currTrainers[tKey].attacker + 1] != null ? <img src={'./chars/mons/'+currTrainers[tKey].mons[currTrainers[tKey].team[currTrainers[tKey].attacker + 1]].name+'.png'}></img>:
                                currTrainers[tKey].team.length > 2 ? <img src={'./chars/mons/'+currTrainers[tKey].mons[currTrainers[tKey].team[0]].name+'.png'}></img> : ""}
                                </div>
                                {loopActiveMonQueueState == "active" ? <div style={{display:"flex",alignItems:"space-between"}}>
                                                                        <button onClick={() => {swapMon(tKey, false)}}>{"<"}</button>
                                                                        <button onClick={() => {swapMon(tKey, true)}}>{">"}</button>
                                                                    </div> : <></>}
                            </div>
                        </div>
                        <div className={' fightCard fightCard-left fightCard-right'} style={{display: "flex", flexDirection: left ? "row" : "row-reverse"}} onClick={loopActiveMonOnClick}>
                            <div className={'flexCol ' + loopActiveMonQueueState + (left ? " fightCard-left" : " fightCard-right")}><img src={tImgURL} className='trainerImg'/>{loopTrainer.name}</div>
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
                            <div id={loopTrainer.name.replace(/\s+/g, '')} className={'flexCol ' + loopActiveMonQueueState + (left ? " fightCard-right" : " fightCard-left")}>
                                <img src={mImgURL}/>
                                <div className='stat-shorthand'>
                                    {"L"+loopActiveMon.lvl + ": "}
                                    <div className='healthbar-container'>
                                        <div className="healthbar">
                                            <div className="healthbar" style={{backgroundColor: 'green',width: (loopActiveMon.currHP/loopActiveMon.hp)*100+"%"}} />
                                        </div>
                                        <div className='healthbar-text'>{(loopActiveMon.currHP/100)*100}/{loopActiveMon.hp}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>)
                    
                }
            }
            catch {
                if (!isLoading) console.log("There was an error loading "+tKey+". They have no mon assigned to them under the key "+currTrainers[tKey].team[0])
            }
            index++
        }
        return trainers
    }

    function turnQueueDisplay() {
        let queue = []
        let index = 0
        for (const i in activeTrainers) { 
            queue.push(<img src={'./chars/ppl/'+ activeTrainers[i] +'.png'} className='queueCard' style={{
                transform: "translateX(" + (index*40) + "%)"}}></img>);
                index++
        }

        return <div className='queue'>
            {queue}
        </div>
    }

    //Processes the action a trainer can take when it is their turn as well as the consequences
    function act(target: string) {
        //Multipurpose value which contains both modified tData [0] & whether the attack resullted in a defeat or not [1]
        let tData = hp(currTrainers,target,currTrainers[activeTrainers[0]].mons[currTrainers[activeTrainers[0]].team[0]])
        let remainingKeys = activeTrainers.filter((tKey) => tKey != activeTrainers[0])
        
        //If target was defeated, set for removal from turn queue
        if (tData[1]) {
            remainingKeys = remainingKeys.filter((tKey) => tKey != target)
        }
        if (remainingKeys.length <= 2) {
            remainingKeys = Object.keys(currTrainers).filter((tKey) => currTrainers[tKey].mons[currTrainers[tKey].team[0]].currHP > 0).sort((a,b) => {console.log(currTrainers[a]);return currTrainers[a].mons[currTrainers[a].team[0]].spd - currTrainers[b].mons[currTrainers[b].team[0]].spd})
            if (remainingKeys.length == 1) {
                tData[0] = win(tData[0], activeTrainers[0])
            }            
        }
        setCurrTrainers(tData[0]) //update tData
        toRender = true
        setActiveTrainers(remainingKeys)
    }

    function effective(attackerType1: string, attackerType2: string, defenderType1: string, defenderType2: string): number {
        let multiplier = 1
        if (types[attackerType1].includes(defenderType1)) {multiplier = multiplier * 2}
        else if (types[attackerType1].includes(defenderType2)) {multiplier = multiplier * 2}
        else if (types[attackerType2] != undefined && types[attackerType2] != "") {
            if (types[attackerType2].includes(defenderType1)) {multiplier = multiplier * 2}
            else if (types[attackerType2].includes(defenderType2)) {multiplier = multiplier * 2}
        }

        if (types[defenderType1+"-R"].includes(attackerType1)) {multiplier = multiplier/2}
        else if (types[defenderType1+"-R"].includes(attackerType2)) {multiplier = multiplier/2}
        else if (types[defenderType2] != undefined && types[defenderType2] != "") {
            if (types[defenderType2+"-R"].includes(attackerType1)) {multiplier = multiplier/2}
            else if (types[defenderType2+"-R"].includes(attackerType2)) {multiplier = multiplier/2}
        }

        //if (multiplier > 1) {console.log("Super Effective!")}
        //else if (multiplier < 1) {console.log("Not Effective!")}

        return multiplier
    }

    function swapMon(tKey: string, next: boolean) {
        toRender = true
        let newAttackerIndex = currTrainers[tKey].attacker
        next ? newAttackerIndex = newAttackerIndex + 1 : newAttackerIndex = newAttackerIndex - 1
        newAttackerIndex  < 0 ? newAttackerIndex = 5 : newAttackerIndex > 5 ? newAttackerIndex = 0 : newAttackerIndex = newAttackerIndex
        newAttackerIndex > currTrainers[tKey].team.length - 1 ? newAttackerIndex = currTrainers[tKey].team.length - 1 : newAttackerIndex = newAttackerIndex
        let tmpCurrTrainers = currTrainers
        tmpCurrTrainers[tKey].attacker = newAttackerIndex
        setCurrTrainers(tmpCurrTrainers)
    }
    
    //Cause a target to lose some of their current HP
    function hp(tData: any, trainer: string, diff: any) {
        let dmgMultiplier = 1
        let attackerType1 = dex.mons[diff.name + diff.form].type1
        let attackerType2 = "noType"
        if (dex.mons[diff.name + diff.form].type2 != undefined && dex.mons[diff.name + diff.form].type2 != "") {attackerType2 = dex.mons[diff.name + diff.form].type2}
        let defenderType1 = dex.mons[tData[trainer].team[0]].type1
        let defenderType2 = "noType"
        if (dex.mons[tData[trainer].team[0]].type2 != undefined && dex.mons[tData[trainer].team[0]].type2 != "") {defenderType2 = dex.mons[tData[trainer].team[0]].type2}

        dmgMultiplier = dmgMultiplier * effective(attackerType1,attackerType2,defenderType1,defenderType2)

       let result = tData[trainer].mons[tData[trainer].team[0]].currHP - (Math.ceil(diff.lvl * dmgMultiplier)) //Calculates loss of HP
       // HP would go out of bounds, bring it back to the edge of bounds
       if (result <= 0) {result = 0}
       else if (result > tData[trainer].mons[tData[trainer].team[0]].hp) { 
            result = tData[trainer].mons[tData[trainer].team[0]].hp
       }
       // Set current hp to calculated result
       tData[trainer].mons[tData[trainer].team[0]].currHP = result

       //If target is defeated, give the attacker xp and the target an hp buff
       if (result == 0) {
        tData[trainer].mons[tData[trainer].team[0]].hp = tData[trainer].mons[tData[trainer].team[0]].hp + 1
        tData = xp(tData,activeTrainers[0],tData[trainer].mons[tData[trainer].team[0]].lvl)
        return [tData,true]
       }
       else {return [tData,false]}
    }

    //Causes mon to gain xp and levelup if threshod is met
    function xp(tData: any, trainer: string, diff: number) {
        let result = currTrainers[trainer].mons[currTrainers[trainer].team[0]].xp + diff //Calculates XP gained
        let lvlUp = false //Assumed levelup threshold not met unless otherwise specified below
        result >= currTrainers[trainer].mons[currTrainers[trainer].team[0]].lvl ? lvlUp = true : lvlUp = false
        //If mon should level up, increase the, taking off the amount that would level them up once and increment their level
        if (lvlUp) {
            tData[trainer].mons[tData[trainer].team[0]].xp = result - currTrainers[trainer].mons[currTrainers[trainer].team[0]].lvl
            tData[trainer].mons[tData[trainer].team[0]].lvl = tData[trainer].mons[tData[trainer].team[0]].lvl + 1
            if (tData[trainer].mons[tData[trainer].team[0]].lvl >= 2) {
                for (const mKey in tData[trainer].mons) {
                    if (tData[trainer].mons[mKey].shine == "" && (dex.mons[tData[trainer].mons[mKey].name + tData[trainer].mons[mKey].form].unlocker) == tData[trainer].team[0]) {
                        tData[trainer].mons[mKey].state = "Available"
                    }
                    else if (tData[trainer].mons[mKey].shine == "Shiny" && 
                                (tData[trainer].mons[mKey].name + tData[trainer].mons[mKey].form) == tData[trainer].team[0]) 
                            {tData[trainer].mons[mKey].state = "Available"}
                }
            }
        }
        else {
            tData[trainer].mons[tData[trainer].team[0]].xp = diff
        }
        //If trainer can level up again, do so recursively until fully leveled up
        result >= currTrainers[trainer].mons[currTrainers[trainer].team[0]].lvl ? tData = xp(tData,trainer,0) : lvlUp = false
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
            {turnQueueDisplay()}
        </div>
        {isLoading ? (
        <p>Loading...</p> 
         ) : (fullCards)}
    </div>
    )
}

export default Fight