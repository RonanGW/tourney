import './CharCard.css'

interface CharCard {
  trainer: any;
}

const CharCard = ({trainer}: CharCard) => {
  return (
    <div className='card'>
      <img src='./chars/ppl/Red.png' className='cardImg'></img>
      {trainer.name}
    </div>
  );
}

export default CharCard
