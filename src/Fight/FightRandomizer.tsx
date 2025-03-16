import React, { useState, useEffect } from 'react'
import Fight from './Fight'

//Interface to pass state variables created by parent object
interface FightSelect {
    menu: any[] // passes the current state (i.e. gallery menu) to this page so it can be undone. Value is [state<string>,setState()]
    trainers: any[] // Current trainer data for populating most up to date character info. Value is [state<trainer>,setState()]
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

let toRender = false

function FightRandomizer({menu, trainers}: FightSelect) {
  const [currTrainers, setCurrTrainers] = useState(Object.fromEntries((((Object.entries<trainer>(trainers[0])) //Filtered duplicate of trainer data modified to indicate the modifiable nature of this menu and onlly include 8 random selections
                                                                      .filter((t) => t[1].state == "Unlocked"))
                                                                      .sort(() => 0.5 - Math.random()))
                                                                      .slice(0, 8)))
  return (
    <Fight menu={menu} trainers={[currTrainers,""]}></Fight>
  )
}

export default FightRandomizer