import '../Gallery.css'

interface MonCard {
  mon: any; //Passes the mon object from  the parent element
}

const MonCard = ({mon}: MonCard) => {
  let form = ""
  let shine = ""
  mon.form != "" ? form = " " + mon.form: form = ""
  mon.shine != "" ? shine = " (" + mon.shine + ")" : shine = ""
  let imgURL='./chars/mons/'+ mon.name.toLowerCase()+form+shine+'.png'
  let cardDisplay = "cardImg "+mon.state

  return (
    <div className='char-card'>
      <img src={imgURL} className={cardDisplay}></img>
      {mon.state == "Unlocked" ? mon.name : "???"}
    </div>
  );
}

export default MonCard
