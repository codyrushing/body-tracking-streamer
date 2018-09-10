import Vector2d from './lib/vector';
import { Noise } from 'noisejs';
import { getScreenDimensions, ctx } from './scene';

const noise = new Noise(Math.random());
const period = 1/1000;
const msPeriod = 1/1000;
const maxSpeed = 7.5;

export default class Particle {
  constructor(params={}){
    // defaults
    this.position = new Vector2d(0,0);
    this.velocity = new Vector2d(0,0);
    this.noiseValue = 0;
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
      .mulS(0.2)
      .add(
        this.getRepelForce(people)
      );

    // people.forEach(
    //   person => {
    //     person.forEach(
    //       keypoint =>
    //     )
    //   }
    // )
  }

  getRepelForce(people){
    const repelForce = new Vector2d(0, 0);
    const segments = people.forEach(
      person => {
        person.segments
          .map(
            segment => segment.map(p => p.pose_abs)
          )
          .map(
            ([s0, s1]) => {
              const [ x0, y0 ] = s0;
              const [ x1, y1 ] = s1;
              const segmentAngle = Math.atan2(
                (y1 - y0) / (x1 - x0)
              );
              this.position
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
  // generateNoiseValue(t){
  //   const period = 1/5000;
  //   const msPeriod = 1/5000;
  //   const dimensions = getScreenDimensions();
  //
  //   this.noiseValue = noise.simplex2(
  //     ...this.position.toArray()
  //       .map(
  //         (v, i) => {
  //           return (Math.abs(dimensions[i]/2 - v)) * period + t * msPeriod
  //         }
  //       )
  //   );
  // }
  generateNoiseValue(t){
    const dimensions = getScreenDimensions();
    this.noiseValue = noise.perlin2(
      ...this.position.toArray()
        .map(
          (v, i) => {
            return Math.abs(dimensions[i]/2 - v) * period + t * msPeriod
          }
        )
    );
  }
  update(people=[], t=0){
    this.generateNoiseValue(t);
    this.velocity.add(this.getAcceleration(people)).constrain(maxSpeed);
    this.position.add(this.velocity)
    this.checkEdges();
    this.draw();
  }
  draw(){
    const [ width ] = getScreenDimensions();
    ctx.beginPath();
    ctx.fillStyle = `hsla(${240 + Math.floor(this.position.x / width * 120)}, 100%, 30%, 1)`;
    ctx.arc(this.position.x, this.position.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
