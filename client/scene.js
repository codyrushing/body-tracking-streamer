import * as d3 from 'd3';
import _ from 'lodash';
import Noise from 'noisejs';
import Particle from './Particle';
import Vector2d from './lib/vector';
import eventEmitter from './event-emitter';
import keypointParser from './keypoint-parser';

var screenDimensions = [];
var width, height;
var people = [];

eventEmitter.on(
  'data',
  p => {
    people = p.map(keypointParser);
  }
);

const numParticles = 3500;

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const hiddenCanvas = document.createElement('canvas');
const hiddenContext = hiddenCanvas.getContext('2d');
hiddenCanvas.style.display = 'none';

document.body.appendChild(canvas);
document.body.appendChild(hiddenCanvas);

function setDimensions(){
  [width, height] = screenDimensions = [
    window.innerWidth,
    window.innerHeight
  ];
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  hiddenCanvas.setAttribute('width', width);
  hiddenCanvas.setAttribute('height', height);
  hiddenContext.globalAlpha = 0.75;
}

setDimensions();

window.addEventListener(
  'resize',
  _.throttle(
    setDimensions,
    500
  )
);

const drawPeople = () => {
  people.forEach(
    person => {
      person.segments.forEach(
        segment => {
          const [start, end] = segment.points.map(
            s => s.pose_v
          );
          // context.save();
          // context.beginPath();
          // context.moveTo(...start.toArray());
          // context.lineTo(...end.toArray());
          // context.stroke();
          // context.restore();
        }
      )
      // person.keypoints.forEach(
      //   keypoint => {
      //     if(keypoint.def === 'Background'){
      //       return;
      //     }
      //     const [ x, y ] = keypoint.pose;
      //     context.beginPath();
      //     context.fillStyle = 'red';
      //     context.arc(x * width, y * height, 5, 0, 2 * Math.PI);
      //     context.fill();
      //     context.strokeStyle = 'black';
      //     context.stroke();
      //   }
      // );
    }
  );
};

//
const particles = [];
d3.range(numParticles).forEach(
  () => {
    particles.push(
      new Particle({
        position: new Vector2d(
          Math.random() * width,
          Math.random() * height
        ),
        velocity: new Vector2d(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).mulS(10)
      })
    );
  }
);

d3.timer(
  t => {
    hiddenContext.clearRect(0, 0, width, height);
    hiddenContext.drawImage(canvas, 0, 0, width, height);
    context.clearRect(0, 0, width, height);
    context.drawImage(hiddenCanvas, 0, 0, width, height);

    drawPeople();

    particles.forEach(
      p => {
        p.update(people, t);
      }
    );

  }
)

export const getScreenDimensions = () => [width, height];
export const ctx = context;
