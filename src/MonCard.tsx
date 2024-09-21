import './CharCard.css'

interface MonCard {
  mon: any;
  state: string;
}

const MonCard = ({mon, state}: MonCard) => {

  let imgURL='./chars/mons/'+ mon.name.toLowerCase()+'.png'
  let cardDisplay = "cardImg"+state

  return (
    <div className='card'>
      <img src={imgURL} className={cardDisplay}></img>
      {mon.state == "Unlocked" ? mon.name : "???"}
    </div>
  );
}

export default MonCard
