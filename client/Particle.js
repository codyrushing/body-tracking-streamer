import * as d3 from 'd3';
import { Noise } from 'noisejs';
import Vector2d from './lib/vector';
import { pointIsPerpendicularToSegment, distanceFromSegment, pointInsidePolygon } from './lib/geometry';
import { getScreenDimensions, ctx, bgCtx } from './scene';

const noise = new Noise(Math.random());
const period = 1/10;
const msPeriod = 1/10000;
const maxSpeed = 12.5;

const sizeScale = d3.scaleLinear()
  .domain([50, 0])
  .range([1, 6])
  .clamp(true);

const hueScale = d3.scaleLinear()
  .domain([0.4, 0.9])
  .range([240, 160])
  .clamp(true);

const lightnessScale = d3.scaleLinear()
  .domain([0, 0.35])
  .range([25, 50])
  .clamp(true);

const generateNoiseValue = function(point){
  const period = 1/1000;
  const msPeriod = 1/1000;
  const dimensions = getScreenDimensions();
  return noise.simplex2(
    ...point.position.toArray()
      .map(
        (v, i) => {
          return (Math.abs(dimensions[i]/2 - v)) * period + point.t * msPeriod
        }
      )
  );
};


export default class Particle {
  constructor(params={}){
    // defaults
    this.position = new Vector2d(0,0);
    this.velocity = new Vector2d(0,0);
    this.noiseValue = 0;
    this._interactingSegments = 0;
    this._person = null;
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
      .mulS(0.5);
  }

  checkBodyProximity(people){
    const repelForce = new Vector2d(0, 0);
    const pLength = this.position.length();

    people.forEach(
      (person, personIndex) => {
        // if the point is already proximal to a person, we can exit
        if(this._person){
          return;
        }
        const setProximalPersonState = (distance=0) => {
          if(this._proximalDistance === null || distance < this._proximalDistance){
            this._proximalDistance = distance;
          }
          this._person = person;
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
              let threshold = 20;
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
    this.noiseValue = generateNoiseValue(this);
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
    this._person = null;
    this._proximalDistance = null;
  }
  draw(t){
    const [ width ] = getScreenDimensions();
    if(!this._person){
      // non proximal point
      bgCtx.beginPath();
      bgCtx.fillStyle = '#555';
      bgCtx.arc(
        ...this.position.toArray(),
        3,
        0,
        Math.PI * 2
      );
      bgCtx.fill();
      return;
    }
    const hue = hueScale(this._person.verticalDisplacement);
    const lightness = lightnessScale(this._person.horizontalDisplacement);
    ctx.fillStyle = `hsl(${(hue + this.t * 1/100) % 360}, 95%, ${lightness}%)`;
    ctx.beginPath();
    ctx.arc(
      ...this.position.toArray(),
      sizeScale(this._proximalDistance),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}
