import '../Gallery.css'

interface MonCard {
  mon: any;
}

const MonCard = ({mon}: MonCard) => {
  let shine = ""
  mon.shine != "" ? shine = " (" + mon.shine + ")" : shine = ""
  let imgURL='./chars/mons/'+ mon.name.toLowerCase()+shine+'.png'
  let cardDisplay = "cardImg "+mon.state

  return (
    <div className='char-card'>
      <img src={imgURL} className={cardDisplay}></img>
      {mon.state == "Unlocked" ? mon.name : "???"}
      {mon.state == "Unlocked" ? shine : ""}
    </div>
  );
}

export default MonCard
