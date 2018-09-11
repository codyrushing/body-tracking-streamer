import Vector2d from './lib/vector';
import { getScreenDimensions } from './scene';

const segmentPairs = [
  [0, 15],
  [0, 16],
  [15, 17],
  [16, 18],
  [0, 1],
  [1, 2],
  [1, 5],
  [2, 3],
  [5, 6],
  [3, 4],
  [6, 7],
  [2, 9],
  [5, 12],
  [8, 9],
  [8, 12],
  [9, 10],
  [12, 13],
  [10, 11],
  [13, 14],
  [11, 24],
  [14, 21],
  [24, 22],
  [21, 19],
];

export default function(keypoints){
  const [width, height] = getScreenDimensions();
  const segments = segmentPairs
    .map(
      (pair) => {
        if(
          pair.every(
            kIndex => keypoints[kIndex].found
          )
        ){
          return pair.map(kIndex => keypoints[kIndex]);
        }
      }
    )
    .filter(
      segment => segment
    )
    .map(
      segment => {
        const points = segment.map(
          segmentPoint => {
            return {
              ...segmentPoint,
              pose_v: new Vector2d(
                segmentPoint.pose[0] * width,
                segmentPoint.pose[1] * height
              )
            };
          }
        );
        const p0 = points[0].pose_v;
        const p1 = points[1].pose_v;
        const midpoint = p0.clone().add(p1.clone().subtract(p0).mulS(0.5));
        return {
          points,
          midpoint
        };
      }
    )
    .sort(
      (a, b) => a.midpoint.length() - b.midpoint.length()
    );

  const torsoPoints = [2, 5, 12, 9].map(
    index => {
      const keypoint = keypoints[index];
      return new Vector2d(
        keypoint.pose[0] * width,
        keypoint.pose[1] * height
      );
    }
  );

  return {
    keypoints,
    segments,
    center: keypoints[8],
    torso: torsoPoints.every(p => p.x !== 0 && p.y !== 0)
      ? torsoPoints
      : null
  };
}
