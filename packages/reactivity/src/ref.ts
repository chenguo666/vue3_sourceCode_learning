import { isTracking, trackEffects, triggerEffects } from "./effect";
import { toReactive } from "./reactive";

/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\ref.ts
 * @Date         : 2023-01-04 14:16:27
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-05 09:09:25
 */

class RefImpl {
  public dep;
  public __v_isRef;
  public _value;

  constructor(public _rawValue) {
    // 原来的值 _rawValue用户传进来是一个对象 需要转成响应式
    this._value = toReactive(_rawValue);
  }
  get value() {
    if (isTracking()) {
      // 是否在effect中取值得
      trackEffects(this.dep || (this.dep = new Set()));
    }
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this._rawValue) {
      this._rawValue = newValue;
      this._value = toReactive(newValue);
      triggerEffects(this.dep);
    }
  }
}

function createRef(value) {
  return new RefImpl(value);
}

export function ref(value) {
  return createRef(value);
}
