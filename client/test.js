import Vector2d from './lib/vector';

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const p1 = new Vector2d(
  Math.random() * window.innerWidth,
  Math.random() * window.innerHeight
);

const p2 = new Vector2d(
  Math.random() * window.innerWidth,
  Math.random() * window.innerHeight
);

const p3 = new Vector2d(
  Math.random() * window.innerWidth,
  Math.random() * window.innerHeight
);

canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);
document.body.appendChild(canvas);

// https://www.wikihow.com/Find-the-Angle-Between-Two-Vectors
const angleBetweenPoints = (p0, p1, origin = new Vector2d(0,0)) => {
  p0 = p0.clone().subtract(origin);
  p1 = p1.clone().subtract(origin);
  return Math.acos(
    p0.clone().dot(p1) / ( p0.length() * p1.length() )
  );
}

const pointIsPerpendicularToSegment = ({p, segment}) => {
  return (
    angleBetweenPoints(p, segment[1], segment[0]) < Math.PI / 2
      &&
    angleBetweenPoints(p, segment[0], segment[1]) < Math.PI / 2
  );
};

const distanceFromSegment = ({p, segment}) => {
  const origin = segment[0];
  const hypotenuse = p.clone().subtract(origin).length();
  return Math.sin(angleBetweenPoints(p, segment[1], origin)) * hypotenuse;
};

console.log(
  pointIsPerpendicularToSegment({
    p: p3,
    segment: [p1, p2]
  })
);

console.log(
  distanceFromSegment({
    p: p3,
    segment: [p1, p2]
  })
);

[p1, p2, p3].forEach(
  (p, i) => {
    context.beginPath();
    if(i > 0){
      context.fillStyle = 'gray';
    }
    if(i > 1){
      context.fillStyle = 'red';
    }
    context.arc(p.x, p.y, 5, 0, Math.PI * 2);
    context.fill();
  }
);
