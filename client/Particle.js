import { Noise } from 'noisejs';
import Vector2d from './lib/vector';
import { pointIsPerpendicularToSegment, distanceFromSegment, pointInsidePolygon } from './lib/geometry';
import { getScreenDimensions, ctx } from './scene';

const noise = new Noise(Math.random());
const period = 1/10;
const msPeriod = 1/10000;
const maxSpeed = 12.5;

export default class Particle {
  constructor(params={}){
    // defaults
    this.position = new Vector2d(0,0);
    this.velocity = new Vector2d(0,0);
    this.noiseValue = 0;
    this._interactingSegments = 0;
    this._personIndex = null;
    Object.keys(params).forEach(
      k => {
        this[k] = params[k];
      }
    );
    return this;
  }
  checkEdges(){
    const [ x, y ] = this.position.toArray();
    const [ width, height ] = getScreenDimensions();
    if(x > width){
      this.position.setX(x % width);
    }
    else if(x < 0){
      this.position.setX(x % width + width);
    }

    if(y > height){
      this.position.setY(y % height);
    }
    else if(y < 0){
      this.position.setY(y % height + height);
    }
  }
  getAcceleration(people){
    return this.getWindForce()
      .mulS(5);

    // people.forEach(
    //   person => {
    //     person.forEach(
    //       keypoint =>
    //     )
    //   }
    // )
  }

  checkBodyProximity(people){
    const repelForce = new Vector2d(0, 0);
    const pLength = this.position.length();

    people.forEach(
      (person, personIndex) => {
        // if the point is already proximal to a person, we can exit
        if(this._personIndex !== null){
          return;
        }
        const setProximalPersonState = (distance=0) => {
          this._proximalDistance = 0;
          this._personIndex = personIndex;
        };
        if(
          person.torso && pointInsidePolygon(
            {
              p: this.position,
              polygon: person.torso
            }
          )
        ){
          setProximalPersonState();
          return;
        }


        person.segments
          .sort(
            (a, b) => {
              return Math.abs(pLength - a.midpoint.length()) - Math.abs(pLength - b.midpoint.length())
            }
          )
          .filter(
            (s, i) => i < 10
          )
          .map(
            segment => {
              let threshold = 25;
              const params = {
                p: this.position,
                segment: segment.points.map(sp => sp.pose_v)
              }
              //
              if(pointIsPerpendicularToSegment(params)){
                let distance = distanceFromSegment(params)
                if(distance < threshold){
                  setProximalPersonState(distance);
                  this._interactingSegments++;
                }
              }
            }
          );
      }
    );
    return repelForce;
  }

  getWindForce(){
    const a = Math.PI * 2 * this.noiseValue;
    return new Vector2d(
      Math.cos(a),
      Math.sin(a)
    );
  }
  generateNoiseValue(){
    const period = 1/50000;
    const msPeriod = 1/10000;
    const dimensions = getScreenDimensions();

    this.noiseValue = noise.simplex2(
      ...this.position.toArray()
        .map(
          (v, i) => {
            return (Math.abs(dimensions[i]/2 - v)) * period + this.t * msPeriod
          }
        )
    );
  }
  // generateNoiseValue(){
  //   const dimensions = getScreenDimensions();
  //   this.noiseValue = noise.perlin2(
  //     ...this.position.toArray()
  //       .map(
  //         (v, i) => {
  //           return Math.abs(dimensions[i]/2 - v) * period + this.t * msPeriod
  //         }
  //       )
  //   );
  // }
  update(people=[], t=0){
    this.t = t;
    this.generateNoiseValue();
    this.checkBodyProximity(people);
    this.velocity.add(this.getAcceleration(people)).constrain(maxSpeed);
    this.position.add(this.velocity);
    this.checkEdges();
    this.draw();
    this.reset();
  }
  reset(){
    this._isPersonProximal = false;
    this._interactingSegments = 0;
    this._personIndex = null;
  }
  draw(){
    const [ width ] = getScreenDimensions();
    ctx.beginPath();
    ctx.fillStyle = this._personIndex !== null
      ? 'red'
      : 'black';
    ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
