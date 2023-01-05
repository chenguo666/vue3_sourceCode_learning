/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\reactive.ts
 * @Date         : 2023-01-02 10:18:02
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-04 14:23:11
 */
import { isObject } from "@vue/shared";
import { track, tirgger } from "./effect";
const enum ReactiveTags {
  IS_REACTIVE = "__v_isReactive",
}
const mutableHandlers: ProxyHandler<Record<any, any>> = {
  get(target, key, receiver) {
    if (key === ReactiveTags.IS_REACTIVE) {
      return true;
    }
    track(target, key);
    const res = Reflect.get(target, key, receiver); // 等价于target[key]
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = (target as any)[key];
    const res = Reflect.set(target, key, value, receiver); // target[key] = value
    // console.log("change");
    if (oldValue !== res) {
      // 值不发生变化 effect不需要重新执行
      tirgger(target, key); // 找属性对应的effect 重新执行
    }
    return res;
  },
};
const reactiveMap = new WeakMap(); // 弱引用 key 必须是对象 key没有被引用可以被自动销毁
function createReactiveObject(target: Object) {
  // 默认认为 target 已经代理过的
  if ((target as any)[ReactiveTags.IS_REACTIVE]) {
    return target;
  }
  // 只针对对象
  if (!isObject(target)) {
    return target;
  }
  const exisitingProxy = reactiveMap.get(target); // 如果缓存有直接使用上次代理的
  if (exisitingProxy) {
    return exisitingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy); // 将原对象和生成的对象做一个映射
  return proxy;
}
export function reactive(target: Object) {
  return createReactiveObject(target);
}
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
