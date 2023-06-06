// gui props
const styles = {
  backgroundColor: '#000000',
  strokeColor: '#00ccee',

  weight: 2,
  weightMin: 0,
  weightMax: 10,
  weightStep: 0.1,
}

const props = {
  shape: ['circle', 'linear'],

  length: 600,
  lengthMin: 0,
  lengthMax: 1500,
  lengthStep: 1,

  width: 25,
  widthMin: 0,
  widthMax: 100,
  widthStep: 1,

  turns: 40,
  turnsMin: 0,
  turnsMax: 100,
  turnsStep: 1,

  gap: 0.25,
  gapMin: 0,
  gapMax: 0.5,
  gapStep: 0.01,

  angle: 360,
  angleMin: 0,
  angleMax: 360,
  angleStep: 1,

  chains: 2,
  chainsMin: 0,
  chainsMax: 7,
  chainsStep: 1,
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(styles.backgroundColor);  
  noStroke();

  // Create DNA Property GUI
  const gui = createGui('DNA Properties');
  gui.addObject(props);

  // Create Style GUI
  const gui2 = createGui('Styles').setPosition(width - 220, 20);
  gui2.addObject(styles);

}

function draw() {
  background(styles.backgroundColor)
  noFill();
  smooth();

  if (props.shape == "circle") circularDNA();
  else linearDNA();
}

const circularDNA = () => {
  const pitch = props.angle / props.turns;
  for (let i = 0; i < props.chains; i++){ 
    const gap = i * props.gap * pitch
    const dna = new CircularDna(pitch, gap);
    dna.calcCoordinates();
    dna.drawDNA(width / 2, height / 2);
  }
}

const linearDNA = () => {
  const pitch = 2 * props.length / props.turns;
  for (let i = 0; i < props.chains; i++){ 
    const gap = - i * props.gap * pitch
    const dna = new LinearDna(pitch, gap);
    dna.calcCoordinates();
    dna.drawDNA(100, height / 2);
  }
}

class Dna {
  static NUM_AXES = 2;

  constructor(pitch, gap) {
    this.pitch = pitch
    this.gap = gap;
    this.numTurns = props.turns;
    this.length = props.length;
    this.width = props.width;

    this.innerAnchor = Array.from({length: this.numTurns + 1}, () => new Array(Dna.NUM_AXES));
    this.outerAnchor = Array.from({length: this.numTurns + 1}, () => new Array(Dna.NUM_AXES));
    this.innerControlLeft = Array.from({length: this.numTurns + 1}, () => new Array(Dna.NUM_AXES));
    this.outerControlLeft = Array.from({length: this.numTurns + 1}, () => new Array(Dna.NUM_AXES));
    this.innerControlRight = Array.from({length: this.numTurns + 1}, () => new Array(Dna.NUM_AXES));
    this.outerControlRight = Array.from({length: this.numTurns + 1}, () => new Array(Dna.NUM_AXES));
  }

  calcCoordinates() {}

  drawDNA(x, y) {
    push();
    translate(x, y);
    strokeWeight(styles.weight); 
    stroke(styles.strokeColor);
    beginShape();
      for(let i = 0; i < this.numTurns + 1; i++){
        bezier(this.innerAnchor[i][0], this.innerAnchor[i][1], this.innerControlLeft[i][0], this.innerControlLeft[i][1], this.outerControlLeft[i][0], this.outerControlLeft[i][1], this.outerAnchor[i][0], this.outerAnchor[i][1]);
        if(i != this.numTurns){
          bezier(this.outerAnchor[i][0], this.outerAnchor[i][1], this.outerControlRight[i+1][0], this.outerControlRight[i+1][1], this.innerControlRight[i+1][0], this.innerControlRight[i+1][1], this.innerAnchor[i+1][0], this.innerAnchor[i+1][1]);         
        }
      }   
    endShape();
    pop();  
  }
}

class CircularDna extends Dna {

  constructor(pitch, gap) {
    super(pitch, gap);
    this.innerRadius = Math.trunc(this.length / PI);
    this.outerRadius = this.innerRadius + this.width;
  }

  calcCoordinates() {
    let sign = 1;
    for(let i = 0; i < this.numTurns + 1; i++){
      let axis = 0;
      //initiation point (inner circle)
      this.innerAnchor[i][axis] = this.innerRadius * cos((i * this.pitch + this.gap) * PI / 180);
      //end point (outer circle)
      this.outerAnchor[i][axis] = this.outerRadius * cos(((i + 1 / 2) * this.pitch + this.gap) * PI / 180);
      //control point 1 (inner)
      this.innerControlLeft[i][axis] = this.innerRadius * cos(((i + 1 / 4) * this.pitch + this.gap) * PI / 180);
      this.innerControlRight[i][axis] = this.innerRadius * cos(((i - 1 / 4) * this.pitch + this.gap) * PI / 180);
      //control point 2 (outer)
      this.outerControlLeft[i][axis] = this.outerRadius * cos(((i + 1 / 4) * this.pitch + this.gap) * PI / 180);
      this.outerControlRight[i][axis] = this.outerRadius * cos(((i - 1 / 4) * this.pitch + this.gap) * PI / 180);     

      //y^2 = r^2 - x^2
      axis = 1;
      sign = (i * this.pitch + this.gap < 180 || 360 < i * this.pitch + this.gap) ? 1 : -1;
      this.innerAnchor[i][axis] = sign * circle(this.innerRadius, this.innerAnchor[i][0]);
      sign = ((i + 1 / 2) * this.pitch + this.gap < 180 || 360 < (i + 1 / 2) * this.pitch + this.gap) ? 1 : -1;
      this.outerAnchor[i][axis] = sign * circle(this.outerRadius, this.outerAnchor[i][0]);
      sign = ((i + 1 / 4) * this.pitch + this.gap < 180 || 360 < (i + 1 / 4) * this.pitch + this.gap) ? 1 : -1;
      this.innerControlLeft[i][axis] = sign * circle(this.innerRadius, this.innerControlLeft[i][0]);
      this.outerControlLeft[i][axis] = sign * circle(this.outerRadius, this.outerControlLeft[i][0]);
      sign = ((i - 1 / 4) * this.pitch + this.gap < 180 || 360 < (i - 1 / 4) * this.pitch + this.gap) ? 1 : -1;
      this.innerControlRight[i][axis] = sign * circle(this.innerRadius, this.innerControlRight[i][0]);
      this.outerControlRight[i][axis] = sign * circle(this.outerRadius, this.outerControlRight[i][0]);
    }
    console.log(this.innerControlRight[0][0], this.innerControlRight[0][1], this.outerControlRight[0][0], this.outerControlRight[0][1]);
  }
}

class LinearDna extends Dna {
  calcCoordinates() {
    for(let i = 0; i < this.numTurns + 1; i++){
      let axis = 0;
      //initiation point
      this.innerAnchor[i][axis] = i * this.pitch + this.gap;
      //end point
      this.outerAnchor[i][axis] = (i + 1/2) * this.pitch + this.gap;
      //control point
      this.innerControlLeft[i][axis] = (i + 1/4) * this.pitch + this.gap;
      this.innerControlRight[i][axis] = (i - 1/4) * this.pitch + this.gap;
      this.outerControlLeft[i][axis] = (i + 1/4) * this.pitch + this.gap;
      this.outerControlRight[i][axis] = (i - 1/4) * this.pitch + this.gap;

      axis = 1;
      this.innerAnchor[i][axis] = 0;
      this.outerAnchor[i][axis] = this.width;
      this.innerControlLeft[i][axis] = 0;
      this.innerControlRight[i][axis] = 0;
      this.outerControlLeft[i][axis] = this.width;
      this.outerControlRight[i][axis] = this.width;
    }
    console.log(this.innerControlRight[0][0], this.innerControlRight[0][1], this.outerControlRight[0][0], this.outerControlRight[0][1]);
  }
}

const circle = (x, y) => {
  return sqrt(sq(x) - sq(y));
}
