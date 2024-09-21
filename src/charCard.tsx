import './CharCard.css'

interface CharCard {
  trainer: any;
  state: string;
}

const CharCard = ({trainer, state}: CharCard) => {

  let imgURL='./chars/ppl/'+ trainer.name.toLowerCase()+'.png'
  let cardDisplay = "cardImg"+state

  return (
    <div className='card'>
      <img src={imgURL} className={cardDisplay}></img>
      {trainer.state == "Unlocked" ? trainer.name : "???"}
    </div>
  );
}

export default CharCard
