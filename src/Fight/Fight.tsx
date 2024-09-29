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
    region: string;
    class: string;
    w: number;
    l: number;
    BP: number;
    mons: object
};


function Fight({menu, trainers}: Fight) {
    const [allTrainers, setActiveTrainers] = useState<[string,trainer][]>(Object.entries(trainers[0]));
    const [remainingTrainers, setRemainingTrainers] = useState<[string,trainer][]>(allTrainers.filter((t) => t[1].state == "Unlocked"))


    const x = useMotionValue(0);
    const rotate = useTransform(x, [-150, 150], [-90, 90]);
    const angle = 360 / 8;
    const rotation = React.useRef(angle);
    let divs = [];
  
    for (let [tkey,value] of remainingTrainers) {
        rotation.current = rotation.current + angle

        divs.push(
        <div
        style={{
            transform: `rotate(${
              rotation.current
            }deg) translate(${250}px) rotate(${
              rotation.current * -1
            }deg)  ${
                trainers[0]["red"].name === value.name ? 'scale(1.5)' : ''
            }`,
            margin: '-40px',
          }}
        >{value.name}</div>)
        }
    return (
    <div>
        <div className="Gallery-header">
            <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>

        <motion.div
            style={{
            rotate: rotate,
            }}
            className="relative border border-4 border-red-900 rounded-full h-[500px] w-[500px] bg-red-200"
            >
            <figure className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <caption className="block text-gray-800 mt-2 text-lg">
            {trainers[0]["red"].name} - {trainers[0]["red"].class}
            </caption>
            </figure>

            {divs}
            
        </motion.div>
    </div>
    )
}

export default Fight