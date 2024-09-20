import './CharCard.css'

interface CharCard {
  trainer: any;
}

const CharCard = ({trainer}: CharCard) => {

  let imgURL='./chars/ppl/'+ trainer.name.toLowerCase()+'.png'

  return (
    <div className='card'>
      <img src={imgURL} className='cardImg'></img>
      {trainer.name}
    </div>
  );
}

export default CharCard
