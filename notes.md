## OpenPose notes
Helpful CLI options:
* __`net_resolution=WxH`__ - the dimensions OP scales the input images down to first before processing.  Lower = faster.  Higher = more accurate.  If you only know one dimension, use -1 for the other dimension to have it autoscale.
* __`disable_multi_thread`__ - reduces latency, but decreases frame rate.
* __`model_pose={MODEL_ID}`__ - Different model provide different keypoints and perform differently.
  * `BODY_25` - default.  25 keypoints
  * `COCO` (18 keypoints)
  * `MPI` (15 keypoints, ~10% faster),
  * `MPI_4_layers` (15 keypoints, even faster but less accurate)
* __`part_candidates`__ - shows partial body parts, instead of requiring all or most of the body to be in frame.
* __`face`__ - enable face tracking
* __`hand`__ - enable hand tracking

## Visualization ideas
What I receive from OpenPose is keypoints.  Drawing these keypoints is probably not that effective - it will look vaguely like a person but won't have the body filled in.  Large gaps between points implies emptiness, which is not actually the case.

Possible better ideas:
* Focus on joint angles.  Perhaps have different colors flow out of joints.
* Focus on hands and head. That and position of spine.
* Relative X,Y positions of different keypoints.  Eg. are the hands above or below the head, and does that trigger something.
* This piece is about staying in constant motion.  Maybe try to visualize motion, as waves perhaps, and stillness
