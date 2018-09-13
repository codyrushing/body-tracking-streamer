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
      if(keypoint.found){
        return new Vector2d(
          keypoint.pose[0] * width,
          keypoint.pose[1] * height
        );
      }
    }
  )
  .filter(p => p);

  const center = keypoints[8];
  const pointsSortedVertically = keypoints
    .filter(p => p.found)
    .sort(
      (a, b) => a.pose[1] - b.pose[1]
    );

  const pointsSortedHorizontally = keypoints
    .filter(p => p.found)
    .sort(
      (a, b) => a.pose[0] - b.pose[0]
    );

  const highest = pointsSortedVertically[0];
  const lowest = pointsSortedVertically[pointsSortedVertically.length-1];
  const leftMost = pointsSortedHorizontally[0];
  const rightMost = pointsSortedHorizontally[pointsSortedHorizontally.length-1];

  const verticalDisplacement = Math.abs(lowest.pose[1] - highest.pose[1]);
  const horizontalDisplacement = Math.abs(rightMost.pose[1] - leftMost.pose[1]);

  const wrists = [keypoints[4], keypoints[7]].filter(p => p.found);
  const armDisplacementFromCenter = center.found && wrists.length
      ? wrists
        .reduce(
          (acc, v) => {
            const comparison = center.found
              ? center
              : (v.def.charAt(0) === 'l')
                ? keyoints[12]
                : keypoints[9]
            if(!comparison){
              return acc;
            }
            return acc + new Vector2d(...v.pose).subtract(new Vector2d(...comparison.pose)).length();
          },
          0
        ) / wrists.length
      : 0.2;

  console.log(verticalDisplacement/horizontalDisplacement);

  return {
    keypoints,
    segments,
    highest,
    lowest,
    verticalDisplacement,
    horizontalDisplacement,
    boundingProfile: verticalDisplacement/horizontalDisplacement,
    armDisplacementFromCenter,
    center,
    centerSpeed: center.found
      ? new Vector2d(...center.v).length()
      : 0.1,
    torso: torsoPoints.length === 4
      ? torsoPoints
      : null
  };
}
