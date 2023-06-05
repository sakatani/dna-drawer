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

  length: 200,
  lengthMin: 0,
  lengthMax: 500,
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
  const gui = createGui('Style');
  gui.addObject(styles);

  // Create Shape GUI
  const gui2 = createGui('DNA Property').setPosition(width - 220, 20);
  gui2.addObject(props);

}

function draw() {
  background(styles.backgroundColor)

  circular = 1
  
  if (circular == 1) circularDNA();
  else linearDNA();
}

const circularDNA = () => {
  noFill();
  smooth();

  const pitch = props.angle / props.turns; //a degree for one this.numTurns
  for (let i = 0; i < props.chains; i++){ 
    angleGap = i * props.gap * pitch
    const dna = new Dna(pitch, angleGap);
    dna.calcCoordinates();
    dna.drawDNA();
  }
}


class Dna {
  static NUM_AXES = 2;

  constructor(pitch, angleGap) {
    this.pitch = pitch
    this.angleGap = angleGap;
    this.numTurns = props.turns;
    this.innerRadius = props.length;
    this.outerRadius = this.innerRadius + props.width;
    console.log(Dna.NUM_AXES);

    this.innerAnchor = Array.from({length: this.numTurns + 1}, () => Array(Dna.NUM_AXES).fill(0));
    this.outerAnchor = Array.from({length: this.numTurns + 1}, () => Array(Dna.NUM_AXES).fill(0));
    this.innerControlLeft = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.outerControlLeft = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.innerControlRight = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
    this.outerControlRight = Array.from({length: this.numTurns + 1}, () => new Float32Array(Dna.NUM_AXES));
  }

  calcCoordinates() {
    for(let i = 0; i < this.numTurns + 1; i++){
      const axis = 0;
        //initiation point (inner circle)
        this.innerAnchor[i][axis] = this.innerRadius * cos((i * this.pitch + this.angleGap) * PI / 180);
        //end point (outer circle)
        this.outerAnchor[i][axis] = this.outerRadius * cos((i * this.pitch + this.pitch / 2 + this.angleGap) * PI / 180);
        //control point 1 (inner)
        this.innerControlLeft[i][axis] = this.innerRadius * cos((i * this.pitch + this.pitch / 4 + this.angleGap) * PI / 180);
        //control point 2 (outer)
        this.outerControlLeft[i][axis] = this.outerRadius * cos((i * this.pitch + this.pitch / 4 + this.angleGap) * PI / 180);
        this.innerControlRight[i][axis] = this.innerRadius * cos((i * this.pitch - this.pitch / 4 + this.angleGap) * PI / 180);
        this.outerControlRight[i][axis] = this.outerRadius * cos((i * this.pitch - this.pitch / 4 + this.angleGap) * PI / 180);     
        //console.log(innerAnchor[i][0],innerAnchor[i][1],outerAnchor[i][0],outerAnchor[i][1]);  
    }
    //console.log("max_pitch", this.numTurns*pitch);
    
    //y^2 = r^2 - x^2
    let sign = 1;
    for(let i = 0; i < this.numTurns + 1; i++){
      const axis = 1;
      if(i * this.pitch + this.angleGap > 180 && i * this.pitch + this.angleGap < 360 ) sign = -1;
      else sign = 1;
        this.innerAnchor[i][axis] = sign * circle(this.innerRadius, this.innerAnchor[i][0]);
      if(i * this.pitch + this.pitch / 2 + this.angleGap > 180 && i * this.pitch + this.pitch / 2 + this.angleGap < 360 ) sign = -1;
      else sign = 1;
        this.outerAnchor[i][axis] = sign * circle(this.outerRadius, this.outerAnchor[i][0]);
      if(i * this.pitch + this.pitch / 4 + this.angleGap > 180 && i * this.pitch + this.pitch / 4 + this.angleGap < 360 ) sign = -1;   
      else sign = 1;
        this.innerControlLeft[i][axis] = sign * circle(this.innerRadius, this.innerControlLeft[i][0]);
        this.outerControlLeft[i][axis] = sign * circle(this.outerRadius, this.outerControlLeft[i][0]);
      if(i * this.pitch - this.pitch / 4 + this.angleGap > 180 && i * this.pitch - this.pitch / 4 + this.angleGap < 360 ) sign = -1;
      else sign = 1;
        this.innerControlRight[i][axis] = sign * circle(this.innerRadius, this.innerControlRight[i][0]);
        this.outerControlRight[i][axis] = sign * circle(this.outerRadius, this.outerControlRight[i][0]);
        //console.log(i, i * this.pitch + this.angleGap, i * this.pitch + this.angleGap + this.pitch / 4, i * this.pitch + this.angleGap - this.pitch / 4); 
    }
    console.log(this.innerControlRight[0][0], this.innerControlRight[0][1], this.outerControlRight[0][0], this.outerControlRight[0][1]);
  }

  drawDNA() {
    push();
    translate(width / 2, height / 2);
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


const circle = (x, y) => {
  return sqrt(sq(x) - sq(y));
}
