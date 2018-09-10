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
      segment => segment.map(
        s => {
          return {
            ...s,
            pose_abs: [
              s.pose[0] * width,
              s.pose[1] * height
            ]
          };
        }
      )
    );

  return {
    keypoints,
    segments,
    center: keypoints[8]
  };
}
