/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\computed.ts
 * @Date         : 2023-01-04 10:49:20
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-04 14:10:18
 */

// 计算属性是一个effect dirty = true
// 计算属性的依赖属性会收集这个effect
// 计算属性具备依赖收集的功能 会收集对应的effect方法
// 第一次执行effect时会取computed  dirty = true
// 此时多次执行会走缓存
// 计算属性依赖的值发生变化  dirty = true 触发计算属性收集的effect
// 再次取计算属性的值 因为 dirty = true 会重新计算

import { isFunction } from "@vue/shared";
import {
  ReactiveEffect,
  isTracking,
  trackEffects,
  triggerEffects,
} from "./effect";
class ComputedRefImpl {
  public dep;
  public _dirty = true;
  public __v_isRef = true;
  public effect;
  public _value;
  constructor(getter, public setter) {
    // 将计算属性 包成effect 里面属性会收集effect
    this.effect = new ReactiveEffect(getter, () => {
      //
      if (!this._dirty) {
        this._dirty = true;
        triggerEffects(this.dep);
      }
    });
  }
  get value() {
    // 取值会走get 方法
    if (isTracking()) {
      // 是否在effect中取值得
      trackEffects(this.dep || (this.dep = new Set()));
    }
    if (this._dirty) {
      // 将结果缓存到this._value 下次就不用run了
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
export function computed(getterOrOptions) {
  console.log(getterOrOptions);
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
