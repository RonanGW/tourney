import '../Gallery.css'

interface MonCard {
  mon: any; //Passes the mon object from  the parent element
}

const loadImage = (imageUrl: string, monKey: string) => {
  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {(img.height != 96 || img.width != 96) ? console.log("Size for "+monKey+" not correct size. Dimensions: h:"+img.height+"--w:"+img.width) : console.log()};
};

const MonCard = ({mon}: MonCard) => {
  let form = ""
  let shine = ""
  mon.form != "" ? form = " " + mon.form: form = ""
  mon.shine != "" ? shine = " (" + mon.shine + ")" : shine = ""
  let imgURL='./chars/mons/'+ mon.name.toLowerCase()+form+shine+'.png'
  let cardDisplay = "cardImg "+mon.state

  return (
    <div className='char-card'>
      {loadImage(imgURL, mon.name + mon.form)}
      <img src={imgURL} className={cardDisplay}></img>
      {mon.state == "Unlocked" ? mon.name : "???"}
    </div>
  );
}

export default MonCard
