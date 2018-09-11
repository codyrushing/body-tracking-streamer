import Vector2d from './vector';
import inside from 'point-in-polygon';

// https://www.wikihow.com/Find-the-Angle-Between-Two-Vectors
export const angleBetweenPoints = (p0, p1, origin = new Vector2d(0,0)) => {
  p0 = p0.clone().subtract(origin);
  p1 = p1.clone().subtract(origin);
  return Math.acos(
    p0.clone().dot(p1) / ( p0.length() * p1.length() )
  );
};

export const pointIsPerpendicularToSegment = ({p, segment}) => {
  return (
    angleBetweenPoints(p, segment[1], segment[0]) < Math.PI / 2
      &&
    angleBetweenPoints(p, segment[0], segment[1]) < Math.PI / 2
  );
};

export const distanceFromSegment = ({p, segment}) => {
  const origin = segment[0];
  const hypotenuse = p.clone().subtract(origin).length();
  return Math.sin(angleBetweenPoints(p, segment[1], origin)) * hypotenuse;
};

export const pointInsidePolygon = ({p, polygon}) => {
  return inside(
    p.toArray(),
    polygon.map(
      vertex => vertex.toArray()
    )
  );
}
