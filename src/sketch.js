// gui params
var numChains = 2;
var numTurns = 40;
var dnaLength = 200;
var dnaWidth = 25;
var drawAngle = 360;
var dnaWeight = 2;
var backgroundColor = '#000000';
var strokeColor = '#00ddff';
var shape = ['circle', 'linear'];


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0,0,0);  
  noStroke();

  // Create Layout GUI
  const gui = createGui('Layout');
  sliderRange(0, 4, 1);
  gui.addGlobals('shape', 'numChains', 'strokeColor', 'backgroundColor');

  // Create Shape GUI
  const gui2 = createGui('Style').setPosition(width - 220, 20);
  sliderRange(0, 50, 1);
  gui2.addGlobals('numTurns', 'dnaWidth');
  sliderRange(0, 400, 0.1);
  gui2.addGlobals('dnaLength', 'dnaAngle');
  sliderRange(0, 10, 0.1);
  gui2.addGlobals('dnaWeight');

}

function draw() {
  background(backgroundColor)

  circular = 1
  
  if (circular == 1) circularDNA();
  else linearDNA();
}

const circularDNA = () => {
  noFill();
  smooth();

  const dna = new Dna();
  dna.calcCoordinates();
  dna.drawDNA();
}


class Dna {

  constructor() {
    this.gap = 0;
    this.innerRadius = dnaLength;
    this.outerRadius = this.innerRadius + dnaWidth;
    this.pitch = drawAngle / numTurns;//a degree for one numTurns

    this.innerAnchor = Array.from({length: numTurns + 1}, () => Array(numChains).fill(0));
    this.outerAnchor = Array.from({length: numTurns + 1}, () => Array(numChains).fill(0));
    this.innerControlLeft = Array.from({length: numTurns + 1}, () => new Float32Array(numChains));
    this.outerControlLeft = Array.from({length: numTurns + 1}, () => new Float32Array(numChains));
    this.innerControlRight = Array.from({length: numTurns + 1}, () => new Float32Array(numChains));
    this.outerControlRight = Array.from({length: numTurns + 1}, () => new Float32Array(numChains));
  }

  calcCoordinates() {
    for(let i = 0; i < numTurns + 1; i++){
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
    //console.log("max_pitch", numTurns*pitch);
    
    //y^2 = r^2 - x^2
    let sign = 1;
    for(let i = 0; i < numTurns + 1; i++){
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
        console.log(i, i * this.pitch + this.gap, i * this.pitch + this.gap + this.pitch / 4, i * this.pitch + this.gap - this.pitch / 4); 
    }
    console.log(this.innerControlRight[0][0], this.innerControlRight[0][1], this.outerControlRight[0][0], this.outerControlRight[0][1]);
  }

  drawDNA() {
    push();
    translate(width / 2, height / 2);
    strokeWeight(dnaWeight); 
    stroke(strokeColor);
    beginShape();
    const a = 1;
    const b = 1;
      for(let i=0; i < numTurns + 1; i++){
        //console.log(innerAnchor[i][0],innerAnchor[i][1],outerAnchor[i][0],outerAnchor[i][1]);
        bezier(a * this.innerAnchor[i][0], b * this.innerAnchor[i][1], a * this.innerControlLeft[i][0], b * this.innerControlLeft[i][1], a * this.outerControlLeft[i][0], b * this.outerControlLeft[i][1], a * this.outerAnchor[i][0], b * this.outerAnchor[i][1]);
        if(i != numTurns){
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
