import './Settings.css'
import FileSaver from 'file-saver';

interface Settings {
  menu: any[] // passes the current state (i.e. settings menu) to this page so it can be undone. Value is [state,setState()]
  tdata: any // passes the current state (i.e. tdata) to this page so it can be undone. Value is [state,setState()]
}

//locally downloads the data file for a reset game
function localReset(data: any) {
  //Creates the content to be written
  const blob = new Blob([JSON.stringify(resetSave(JSON.parse(data)))], { type: 'application/json' });
  FileSaver.saveAs(blob, "trainers.json");
}

function localDownload(data: any) {
  //Creates the content to be written
  const blob = new Blob([JSON.stringify(JSON.parse(data))], { type: 'application/json' });
  FileSaver.saveAs(blob, "trainers.json");
}

// Returns a object containing the default starting state for a save based on the content provided in defaults.json
function resetSave(data: any) {

  let trainersSaveData: any = {} //For storing the default data scheme to be downloaded
  let trainerList: any = {}

  //Initialize each trainer using a lowercase version of their name as the key
  data.trainers.forEach((trainer: any) => {
    trainersSaveData[trainer.name] = {
        name: trainer.name,
        state: "Unlocked",
        starter: trainer.starter + trainer.starterForm,
        class: trainer.class,
        region: trainer.region,
        w: 0,
        l: 0,
        BP: 0,
        mons: {}
    }
    trainerList[trainer.name] = {
      name: trainer.name,
      state: "Unlocked",
      starter: trainer.starter + trainer.starterForm,
      class: trainer.class,
      region: trainer.region,
      w: 0,
      l: 0,
      BP: 0,
      mons: {}
  }
  });

  
    //Intialize each mon for each trainer
    Object.keys(data.mons).forEach((monKey: any) => {
      data.trainers.forEach((trainer: any) => {
      let monState = "Hidden"
      if (data.mons[monKey].name == trainer.starter && data.mons[monKey].form == trainer.starterForm //If trainer default starter and form match
      ) {monState = "Unlocked"}
      else if (data.mons[monKey].name == trainer.starter || data.mons[monKey].unlocker == "" ||  data.mons[monKey].unlocker == trainer.starter + trainer.starterForm//If trainer default starter, a default reveal or revealed based starter, set to reveal. Otherwise, hide
      ) {monState = "Locked"} else {monState = "Hidden"}
        trainersSaveData[trainer.name].mons[data.mons[monKey].name + data.mons[monKey].form] = {
            name: data.mons[monKey].name,
            form: data.mons[monKey].form,
            shine: "",
            state: monState,
            lvl: 1,
            xp: 0,
            hp: 1,
            atk: 1
        }
      //Intialize the shiny version of each mon for each trainer
      data.mons[monKey].name == trainer.starter ? monState = "Locked" : monState = "Hidden"
        trainersSaveData[trainer.name].mons[data.mons[monKey].name + data.mons[monKey].form + "shiny"] = {
          name:  data.mons[monKey].name,
          form: data.mons[monKey].form,
          shine: "Shiny",
          state: monState,
          lvl: 1,
          xp: 0,
          hp: 1,
          atk: 1
      }
    })
  });

  let i = 1
  Object.keys(trainersSaveData).forEach(async (trainer: any) => {
    const timeoutId = window.setTimeout(() => {
      const blob = new Blob([JSON.stringify(trainersSaveData[trainer])], { type: 'application/json' });
      FileSaver.saveAs(blob, trainer +".json");
    }, 500*i)
    i++
  })

  return trainerList
}

// Settings Menu
function Settings({menu, tdata}: Settings) {
  let data = "N/A" // Initial Placeholder for the content to be read from 
  
  // Replaces data variable with the contents of defaults.json in the game's folder 
  fetch('/dex.json').then(response => {return response.json()}).then(tmp => data = JSON.stringify(tmp))

    return (
      <div>
        <div className="Gallery-header">
          <button onClick={() => {menu[1]("Main-Menu")}}>Back Main Menu</button>
        </div>
        <div className="Settings" style={{display: "flex", flexDirection: "column", width: "50vh"}}>
          <button onClick={() => {localReset(data)}}>Reset Save data</button>
          <button onClick={() => {localDownload(JSON.stringify(tdata))}}>Download Save data</button>
        </div>
      </div>
  );
}

export default Settings