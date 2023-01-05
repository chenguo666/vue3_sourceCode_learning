// import { ReactiveEffect } from "vue";

/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\effect.ts
 * @Date         : 2023-01-02 10:18:19
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-04 14:01:47
 */
let effectStack = []; // effect执行的时候可以存储正确的关系
let activeEffect;
function cleanupEffect(effect) {
  const { deps } = effect;
  for (const dep of deps) {
    dep.delete(effect);
  }
}
// 属性发送变化 触发的是dep -> effect
export class ReactiveEffect {
  // 让effect 记录了依赖了那些属性 同时要记录当前属性依赖了哪个effect
  active = true;
  deps = [];
  constructor(public fn, public scheduler?) {
    // this.fn = fn
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    if (!effectStack.includes(this)) {
      // 屏蔽同一个effect
      try {
        effectStack.push((activeEffect = this));
        // console.log(effectStack, activeEffect);
        return this.fn(); // 取值 new proxy 会执行get方法 依赖收集
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  }
  stop() {
    console.log("stop");
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}
export function isTracking() {
  return activeEffect !== undefined;
}
export function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
const targetMap = new WeakMap();
export function track(target, key) {
  // console.log(target, key, activeEffect);
  if (!isTracking()) {
    // 如果属性不依赖于effect 直接跳出
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  // let shouldTrack = !dep.has(activeEffect);
  // if (shouldTrack) {
  //   dep.add(activeEffect);
  //   activeEffect.deps.push(dep);
  // }
  trackEffects(dep);
  console.log(activeEffect.deps);
}
export function tirgger(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) return;
  let deps = [];
  if (key !== undefined) {
    deps.push(depsMap.get(key));
  }
  let effects = [];
  for (const dep of deps) {
    effects.push(...dep);
  }
  triggerEffects(effects);
  // for (const effect of effects) {
  //   if (effect !== activeEffect) {
  //     if (effect.scheduler) {
  //       return effect.scheduler();
  //     }
  //     effect.run();
  //   }
  // }
}
export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        return effect.scheduler();
      }
      effect.run();
    }
  }
}
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run(); // 会默认让fn执行一次
  let runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// p2 18:00
// p2 54:36
// vue3 响应式原理 取值时 收集对应的effect 改值时找到对应的effect执行
