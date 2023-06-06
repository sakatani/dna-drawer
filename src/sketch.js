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

  // Create Layout GUI
  const gui = createGui('DNA Properties');
  gui.addObject(props);

  // Create Shape GUI
  const gui2 = createGui('Styles').setPosition(width - 220, 20);
  gui2.addObject(styles);

}

function draw() {
  background(styles.backgroundColor)
  
  if (props.shape == "circle") circularDNA();
  else linearDNA();
}

const circularDNA = () => {
  noFill();
  smooth();

  const pitch = props.angle / props.turns; //a degree for one this.numTurns
  for (let i = 0; i < props.chains; i++){ 
    const gap = i * props.gap * pitch
    const dna = new CircularDna(pitch, gap);
    dna.calcCoordinates();
    dna.drawDNA(width / 2, height / 2);
  }
}

const linearDNA = () => {
  noFill();
  smooth();

  const pitch = 2 * props.length / props.turns; //a degree for one this.numTurns
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

    this.innerAnchor = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.outerAnchor = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.innerControlLeft = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.outerControlLeft = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.innerControlRight = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.outerControlRight = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
  }

  calcCoordinates() {}

  drawDNA(x, y) {
    push();
    translate(x, y);
    strokeWeight(styles.weight); 
    stroke(styles.strokeColor);
    beginShape();
    const a = 1;
    const b = 1;
      for(let i = 0; i < this.numTurns + 1; i++){
        //console.log(innerAnchor[i][0],innerAnchor[i][1],outerAnchor[i][0],outerAnchor[i][1]);
        bezier(a * this.innerAnchor[i][0], b * this.innerAnchor[i][1], a * this.innerControlLeft[i][0], b * this.innerControlLeft[i][1], a * this.outerControlLeft[i][0], b * this.outerControlLeft[i][1], a * this.outerAnchor[i][0], b * this.outerAnchor[i][1]);
        if(i != this.numTurns){
          //console.log(outerAnchor[i][0],outerAnchor[i][1],innerAnchor[i+1][0],innerAnchor[i+1][1]);
          bezier(a * this.outerAnchor[i][0], b * this.outerAnchor[i][1], a * this.outerControlRight[i+1][0], b * this.outerControlRight[i+1][1], a * this.innerControlRight[i+1][0], b * this.innerControlRight[i+1][1], a * this.innerAnchor[i+1][0], b * this.innerAnchor[i+1][1]);         
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
    for(let i = 0; i < this.numTurns + 1; i++){
      const axis = 0;
        //initiation point (inner circle)
        this.innerAnchor[i][axis] = this.innerRadius * cos((i * this.pitch + this.gap) * PI / 180);
        //end point (outer circle)
        this.outerAnchor[i][axis] = this.outerRadius * cos((i * this.pitch + this.pitch / 2 + this.gap) * PI / 180);
        //control point 1 (inner)
        this.innerControlLeft[i][axis] = this.innerRadius * cos((i * this.pitch + this.pitch / 4 + this.gap) * PI / 180);
        //control point 2 (outer)
        this.outerControlLeft[i][axis] = this.outerRadius * cos((i * this.pitch + this.pitch / 4 + this.gap) * PI / 180);
        this.innerControlRight[i][axis] = this.innerRadius * cos((i * this.pitch - this.pitch / 4 + this.gap) * PI / 180);
        this.outerControlRight[i][axis] = this.outerRadius * cos((i * this.pitch - this.pitch / 4 + this.gap) * PI / 180);     
        //console.log(innerAnchor[i][0],innerAnchor[i][1],outerAnchor[i][0],outerAnchor[i][1]);  
    }
    //console.log("max_pitch", this.numTurns*pitch);
    
    //y^2 = r^2 - x^2
    let sign = 1;
    for(let i = 0; i < this.numTurns + 1; i++){
      const axis = 1;
      if(i * this.pitch + this.gap > 180 && i * this.pitch + this.gap < 360 ) sign = -1;
      else sign = 1;
        this.innerAnchor[i][axis] = sign * circle(this.innerRadius, this.innerAnchor[i][0]);
      if(i * this.pitch + this.pitch / 2 + this.gap > 180 && i * this.pitch + this.pitch / 2 + this.gap < 360 ) sign = -1;
      else sign = 1;
        this.outerAnchor[i][axis] = sign * circle(this.outerRadius, this.outerAnchor[i][0]);
      if(i * this.pitch + this.pitch / 4 + this.gap > 180 && i * this.pitch + this.pitch / 4 + this.gap < 360 ) sign = -1;   
      else sign = 1;
        this.innerControlLeft[i][axis] = sign * circle(this.innerRadius, this.innerControlLeft[i][0]);
        this.outerControlLeft[i][axis] = sign * circle(this.outerRadius, this.outerControlLeft[i][0]);
      if(i * this.pitch - this.pitch / 4 + this.gap > 180 && i * this.pitch - this.pitch / 4 + this.gap < 360 ) sign = -1;
      else sign = 1;
        this.innerControlRight[i][axis] = sign * circle(this.innerRadius, this.innerControlRight[i][0]);
        this.outerControlRight[i][axis] = sign * circle(this.outerRadius, this.outerControlRight[i][0]);
        //console.log(i, i * this.pitch + this.gap, i * this.pitch + this.gap + this.pitch / 4, i * this.pitch + this.gap - this.pitch / 4); 
    }
    console.log(this.innerControlRight[0][0], this.innerControlRight[0][1], this.outerControlRight[0][0], this.outerControlRight[0][1]);
  }
}

class LinearDna extends Dna {
  calcCoordinates() {
    for(let i = 0; i < this.numTurns + 1; i++){
      const axis = 0;
      //initiation point
      this.innerAnchor[i][axis] = i * this.pitch + this.gap;
      //end point
      this.outerAnchor[i][axis] = (i + 1/2) * this.pitch + this.gap;
      //control point
      this.innerControlLeft[i][axis] = (i + 1/4) * this.pitch + this.gap;
      this.outerControlLeft[i][axis] = (i + 1/4) * this.pitch + this.gap;
      this.innerControlRight[i][axis] = (i - 1/4) * this.pitch + this.gap;
      this.outerControlRight[i][axis] = (i - 1/4) * this.pitch + this.gap;
    }

    for(let i = 0; i < this.numTurns + 1; i++){
      const axis = 1;
      this.innerAnchor[i][axis] = 0;
      this.outerAnchor[i][axis] = this.width;
      this.innerControlLeft[i][axis] = 0;
      this.outerControlLeft[i][axis] = this.width;
      this.innerControlRight[i][axis] = 0;
      this.outerControlRight[i][axis] = this.width;
    }
    console.log(this.innerControlRight[0][0], this.innerControlRight[0][1], this.outerControlRight[0][0], this.outerControlRight[0][1]);
  }
}

const circle = (x, y) => {
  return sqrt(sq(x) - sq(y));
}
