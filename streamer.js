const { Transform } = require('stream');
const Vec2 = require('vector2d');
const _ = require('lodash');

const models = {
  BODY_25: [
    'Nose',
    'Neck',
    'RShoulder',
    'RElbow',
    'RWrist',
    'LShoulder',
    'LElbow',
    'LWrist',
    'MidHip',
    'RHip',
    'RKnee',
    'RAnkle',
    'LHip',
    'LKnee',
    'LAnkle',
    'REye',
    'LEye',
    'REar',
    'LEar',
    'LBigToe',
    'LSmallToe',
    'LHeel',
    'RBigToe',
    'RSmallToe',
    'RHeel',
    'Background'
  ]
}

const wiggle = (vals=[], { smoothing = 0.4 }={}) => {
  if(!vals.length){
    return 0;
  }
  const total = vals.reduce(
    (acc, val, i) => {
      if(i < vals.length-1){
        acc += Math.abs(vals[i] - vals[i+1]);
      }
      return acc;
    },
    0
  );
  return total / vals.length * (1 - smoothing);
}

class OPDataTransformer extends Transform {
  constructor(options){
    super(options);
    this.options = {
      model: 'BODY_25',
      ...options
    };
    this.model = models[this.options.model];
    this.people = [];
  }

  getModel(){
    return models[this.model] || models.BODY_25;
  }

  processFrame({ people }){
    this.people = [
      ...people.map(
        (person, i) => {

          // grab pre-existing value for this person
          const existing = this.people[i] || {
            _prevFrames: []
          };

          // if existing value has data from before, shift it onto the _prevFrames storage array
          if(existing.pose_keypoints_2d && existing.pose_keypoints_2d.length){
            existing._prevFrames.unshift(existing.pose_keypoints_2d);
            existing._prevFrames = existing._prevFrames.slice(0, 30);
          }

          // keypoint data is in a flat array
          // each point has three values: x, y, and confidence
          // chunk the data into groups of three to isolate the keypoints
          const pose_keypoints_2d = _.chunk(person.pose_keypoints_2d, 3)
            .map(
              (keypoint, i) => {
                const pose = [keypoint[0], keypoint[1]];
                const found = pose.every( coord => coord !== 0);
                const recentPoints = existing._prevFrames;
                const prevPoint = recentPoints[0]
                  ? recentPoints[0][i]
                  : null;

                const recentCorrespondingPoints = recentPoints.map(
                  p => {
                    try {
                      return p[i];
                    }
                    catch(err) {
                      return null;
                    }
                  }
                )
                .filter(p => p);

                return {
                  def: this.model[i],
                  pose,
                  found,
                  v: prevPoint && found
                    ? new Vec2.Vector(...pose).subtract( new Vec2.Vector(...prevPoint.pose) ).toArray()
                    : [0, 0],
                  m: [
                    found
                      ? wiggle(
                        recentCorrespondingPoints.map(p => p.pose[0])
                      )
                      : 0,
                    found
                      ? wiggle(
                        recentCorrespondingPoints.map(p => p.pose[1])
                      )
                      : 0
                  ]
                };
              }
            );

          return {
            ...existing,
            pose_keypoints_2d,
            missedFrame: false
          };
        }
      )
    ];

    // OpenPose might incorrectly miss a person for a single frame
    // if so, mark it as missedFrame: true
    // on the next frame, if this person is still missing, then mark them as null
    this.people
      .slice(people.length)
      .forEach(
        (missingPerson, v) => {
          missingPerson = missingPerson.missedFrame
            ? null
            : {
              ...missingPerson,
              missedFrame: true
            }
        }
      );

    this.people = this.people.filter(p => p);
    return this.people;
  }

  _transform(filePath, encoding, done){
    const data = this.processFrame(require(filePath));
    this.push(data.map(p => p.pose_keypoints_2d));
    done();
  }
}

module.exports = new OPDataTransformer({
  objectMode: true
});
