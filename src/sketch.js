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
  constructor(pitch, gap) {
    this.pitch = pitch
    this.gap = gap;
    this.numTurns = props.turns;
    this.length = props.length;
    this.width = props.width;

    this.innerAnchor = Array(this.numTurns + 1).fill(null).map(() => ({}));
    this.outerAnchor = Array(this.numTurns + 1).fill(null).map(() => ({}));
    this.innerControlLeft = Array(this.numTurns + 1).fill(null).map(() => ({}));
    this.outerControlLeft = Array(this.numTurns + 1).fill(null).map(() => ({}));
    this.innerControlRight = Array(this.numTurns + 1).fill(null).map(() => ({}));
    this.outerControlRight = Array(this.numTurns + 1).fill(null).map(() => ({}));
  }

  calcCoordinates() {
    console.log(this.innerControlRight[0].x, this.innerControlRight[0].y, this.outerControlRight[0].x, this.outerControlRight[0].y);
  }

  drawDNA(x, y) {
    push();
    translate(x, y);
    strokeWeight(styles.weight); 
    stroke(styles.strokeColor);
    beginShape();
      for(let i = 0; i <= this.numTurns; i++){
        bezier(this.innerAnchor[i].x, this.innerAnchor[i].y,
              this.innerControlLeft[i].x, this.innerControlLeft[i].y,
              this.outerControlLeft[i].x, this.outerControlLeft[i].y,
              this.outerAnchor[i].x, this.outerAnchor[i].y);
        if(i != this.numTurns){
          bezier(this.outerAnchor[i].x, this.outerAnchor[i].y,
            this.outerControlRight[i+1].x, this.outerControlRight[i+1].y,
            this.innerControlRight[i+1].x, this.innerControlRight[i+1].y,
            this.innerAnchor[i+1].x, this.innerAnchor[i+1].y);         
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
    const RAD = PI / 180;
    for(let i = 0; i <= this.numTurns; i++){     
      //initiation point (inner circle)
      let angle = i * this.pitch + this.gap;
      this.innerAnchor[i].x = this.innerRadius * cos(angle * RAD);
      this.innerAnchor[i].y = circleYCoordinate(angle, this.innerRadius, this.innerAnchor[i].x);
      //end point (outer circle)
      angle = (i + 1 / 2) * this.pitch + this.gap;
      this.outerAnchor[i].x = this.outerRadius * cos(angle * RAD);
      this.outerAnchor[i].y = circleYCoordinate(angle, this.outerRadius, this.outerAnchor[i].x);
      //control point 1 (inner)
      angle = (i + 1 / 4) * this.pitch + this.gap;
      this.innerControlLeft[i].x = this.innerRadius * cos(angle * RAD);
      this.outerControlLeft[i].x = this.outerRadius * cos(angle * RAD);
      this.innerControlLeft[i].y = circleYCoordinate(angle, this.innerRadius, this.innerControlLeft[i].x);
      this.outerControlLeft[i].y = circleYCoordinate(angle, this.outerRadius, this.outerControlLeft[i].x);
      //control point 2 (outer)
      angle = (i - 1 / 4) * this.pitch + this.gap;
      this.innerControlRight[i].x = this.innerRadius * cos(angle * RAD);
      this.outerControlRight[i].x = this.outerRadius * cos(angle * RAD);
      this.innerControlRight[i].y = circleYCoordinate(angle, this.innerRadius, this.innerControlRight[i].x);
      this.outerControlRight[i].y = circleYCoordinate(angle, this.outerRadius, this.outerControlRight[i].x);
    }
    super.calcCoordinates();
  }
}

class LinearDna extends Dna {
  calcCoordinates() {
    for(let i = 0; i <= this.numTurns; i++){
      //initiation point
      this.innerAnchor[i].x = i * this.pitch + this.gap;
      this.innerAnchor[i].y = 0;
      //end point
      this.outerAnchor[i].x = (i + 1/2) * this.pitch + this.gap;
      this.outerAnchor[i].y = this.width;
      //control point
      this.innerControlLeft[i].x = (i + 1/4) * this.pitch + this.gap;
      this.innerControlLeft[i].y = 0;
      this.innerControlRight[i].x = (i - 1/4) * this.pitch + this.gap;
      this.innerControlRight[i].y = 0;
      this.outerControlLeft[i].x = (i + 1/4) * this.pitch + this.gap;
      this.outerControlLeft[i].y = this.width;
      this.outerControlRight[i].x = (i - 1/4) * this.pitch + this.gap;
      this.outerControlRight[i].y = this.width;
    }
    super.calcCoordinates();
  }
}

const circleYCoordinate = (angle, r, x) => {
  // y^2 = r^2 - x^2
  sign = (180 < angle && angle < 360) ? -1 : 1;
  return sign * sqrt(sq(r) - sq(x));
}
