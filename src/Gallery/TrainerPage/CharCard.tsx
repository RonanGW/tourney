import '../Gallery.css'

interface CharCard {
  trainer: any;
}

const loadImage = (imageUrl: string, tKey: string) => {
  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {(img.height != 96 || img.width != 96) ? console.log("Size for "+tKey+" not correct size. Dimensions: h:"+img.height+"--w:"+img.width) : console.log()};
};

const CharCard = ({trainer}: CharCard) => {

  let imgURL='./chars/ppl/'+ trainer.name.toLowerCase()+'.png'
  let cardDisplay = "cardImg "+trainer.state

  return (
    <div className='char-card'>
      {loadImage(imgURL, trainer.name)}
      <img src={imgURL} className={cardDisplay}></img>
      {trainer.state == "Unlocked" ? trainer.name : "???"}
    </div>
  );
}

export default CharCard
