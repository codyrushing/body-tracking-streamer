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
