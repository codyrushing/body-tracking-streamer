import * as d3 from 'd3';
import _ from 'lodash';
import eventEmitter from './event-emitter';

var screenDimensions = [];
var width, height;
var people = [];

eventEmitter.on(
  'data',
  p => {
    people = p;
  }
);

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
  hiddenContext.globalAlpha = 0.5;
}

setDimensions();

window.addEventListener(
  'resize',
  _.throttle(
    setDimensions,
    500
  )
);


d3.timer(
  t => {
    hiddenContext.clearRect(0, 0, width, height);
    hiddenContext.drawImage(canvas, 0, 0, width, height);
    context.clearRect(0, 0, width, height);
    context.drawImage(hiddenCanvas, 0, 0, width, height);

    people.forEach(
      person => {
        person.forEach(
          keypoint => {
            if(keypoint.def === 'Background'){
              return;
            }
            const [ x, y ] = keypoint.pose;
            context.beginPath();
            context.fillStyle = 'red';
            context.arc(x * width, y * height, 5, 0, 2 * Math.PI);
            context.fill();
            context.strokeStyle = 'black';
            context.stroke();
          }
        );
      }
    );
  }
)
