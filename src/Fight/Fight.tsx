import React, { useState, useEffect } from 'react'
import './Fight.css'
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface Fight {
  menu: any[]
  trainers: any[]

}

interface mon {
  state: string;
  lvl: number;
  xp: number;
  hp: number;
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
    const [remainingTrainers, setRemainingTrainers] = useState<[string,trainer][]>((((allTrainers).filter((t) => t[1].state == "Hidden")).sort(() => 0.5 - Math.random())).slice(0, 8))
    let leftTrainers = [];
    let rightTrainers = [];
  
    let index = 0
    for (let [tkey,value] of remainingTrainers) {
        let tImgURL='./chars/ppl/'+ value.name.toLowerCase()+'.png'
        let mImgURL='./chars/mons/'+ value.starter.toLowerCase()+'.png'

        index < remainingTrainers.length /2 ?
        leftTrainers.push(<div style={{display:"flex",flexDirection:"row"}}>
                            <div><img src={tImgURL}></img></div>
                            <div style={{display:"flex",flexDirection:"column"}}><img src={mImgURL}></img>1 / {value.mons[value.starter].hp}</div>
                          </div>) :
        rightTrainers.push(<div style={{display:"flex",flexDirection:"row"}}>
                            <div style={{display:"flex",flexDirection:"column"}}><img src={mImgURL}></img>1 / {value.mons[value.starter].hp}</div>
                            <div><img src={tImgURL}></img></div>
                           </div>)
        index++
    }

    return (
    <div>
        <div className="Gallery-header">
            <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>
        <div
        style={{display:"flex",flexDirection:"row", justifyContent:"space-between",margin:"5vw"}}>
            <div
            style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
                {leftTrainers}
            </div>
            <div
            style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
                {rightTrainers}
            </div>
        </div>
    </div>
    )
}

export default Fight