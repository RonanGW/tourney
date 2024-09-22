import '../Gallery.css'

interface CharCard {
  trainer: any;
}

const CharCard = ({trainer}: CharCard) => {

  let imgURL='./chars/ppl/'+ trainer.name.toLowerCase()+'.png'
  let cardDisplay = "cardImg "+trainer.state

  return (
    <div className='char-card'>
      <img src={imgURL} className={cardDisplay}></img>
      {trainer.state == "Unlocked" ? trainer.name : "???"}
    </div>
  );
}

export default CharCard
