import d3 from 'd3';
import _ from 'lodash';

var screenDimensions = [];
var width, height;
function setDimensions(){
  [width, height] = screenDimensions = [
    window.innerWidth,
    window.innerHeight
  ];
}

setDimensions();

window.addEventListener(
  'resize',
  _.throttle(
    setDimensions,
    500
  )
);

var [ width, height ] = screenDimensions;

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);
const hiddenCanvas = document.createElement('canvas');
const hiddenContext = hiddenCanvas.getContext('2d');
hiddenCanvas.setAttribute('width', width);
hiddenCanvas.setAttribute('height', height);
hiddenCanvas.style.display = 'none';

document.body.appendChild(canvas);
document.body.appendChild(hiddenCanvas);

hiddenContext.globalAlpha = 0.5;
