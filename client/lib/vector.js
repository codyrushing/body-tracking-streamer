import * as Vec2 from 'vector2d';

export default class Vector2d extends Vec2.Vector {
  constrain(max){
    if(this.length() > max){
      this.normalize().mulS(max);
    }
    return this;
  }
}
