import '../Gallery.css'

interface MonCard {
  mon: any;
}

const MonCard = ({mon}: MonCard) => {

  let imgURL='./chars/mons/'+ mon.name.toLowerCase()+'.png'
  let cardDisplay = "cardImg "+mon.state

  return (
    <div className='char-card'>
      <img src={imgURL} className={cardDisplay}></img>
      {mon.state == "Unlocked" ? mon.name : "???"}
    </div>
  );
}

export default MonCard
