import React, { useState, useEffect } from 'react'

//Interface to pass state variables created by parent object
interface FightSelect {
    menu: any[] // passes the current state (i.e. gallery menu) to this page so it can be undone. Value is [state<string>,setState()]
    trainers: any[] // Current trainer data for populating most up to date character info. Value is [state<trainer>,setState()]
}

function FightSelect({menu, trainers}: FightSelect) {

    return (
    <>
    <button onClick={() => {menu[1]("Fight")}}>
      Start Tourney
    </button>
    </>
    )
}

export default FightSelect