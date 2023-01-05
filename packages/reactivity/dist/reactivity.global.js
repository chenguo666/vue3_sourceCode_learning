var VueReactivity = (function (exports) {
  'use strict';

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
  class ReactiveEffect {
      constructor(fn, scheduler) {
          this.fn = fn;
          this.scheduler = scheduler;
          // 让effect 记录了依赖了那些属性 同时要记录当前属性依赖了哪个effect
          this.active = true;
          this.deps = [];
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
              }
              finally {
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
  function isTracking() {
      return activeEffect !== undefined;
  }
  function trackEffects(dep) {
      let shouldTrack = !dep.has(activeEffect);
      if (shouldTrack) {
          dep.add(activeEffect);
          activeEffect.deps.push(dep);
      }
  }
  const targetMap = new WeakMap();
  function track(target, key) {
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
  function tirgger(target, key) {
      let depsMap = targetMap.get(target);
      if (!depsMap)
          return;
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
  function triggerEffects(dep) {
      for (const effect of dep) {
          if (effect !== activeEffect) {
              if (effect.scheduler) {
                  return effect.scheduler();
              }
              effect.run();
          }
      }
  }
  function effect(fn) {
      const _effect = new ReactiveEffect(fn);
      _effect.run(); // 会默认让fn执行一次
      let runner = _effect.run.bind(_effect);
      runner.effect = _effect;
      return runner;
  }
  // p2 18:00
  // p2 54:36
  // vue3 响应式原理 取值时 收集对应的effect 改值时找到对应的effect执行

  /*
   * @Description  :
   * @Author       : chenguo666
   * @FilePath     : \vue3_sourceCode_learning\packages\shared\src\index.ts
   * @Date         : 2022-12-28 19:35:48
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-04 13:17:09
   */
  function isObject(value) {
      return typeof value === "object" && value !== null;
  }
  function isFunction(value) {
      return typeof value === "function";
  }

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\reactive.ts
   * @Date         : 2023-01-02 10:18:02
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-04 14:23:11
   */
  const mutableHandlers = {
      get(target, key, receiver) {
          if (key === "__v_isReactive" /* ReactiveTags.IS_REACTIVE */) {
              return true;
          }
          track(target, key);
          const res = Reflect.get(target, key, receiver); // 等价于target[key]
          return res;
      },
      set(target, key, value, receiver) {
          let oldValue = target[key];
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
  function createReactiveObject(target) {
      // 默认认为 target 已经代理过的
      if (target["__v_isReactive" /* ReactiveTags.IS_REACTIVE */]) {
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
  function reactive(target) {
      return createReactiveObject(target);
  }
  function toReactive(value) {
      return isObject(value) ? reactive(value) : value;
  }

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\computed.ts
   * @Date         : 2023-01-04 10:49:20
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-04 14:10:18
   */
  class ComputedRefImpl {
      constructor(getter, setter) {
          this.setter = setter;
          this._dirty = true;
          this.__v_isRef = true;
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
  function computed(getterOrOptions) {
      console.log(getterOrOptions);
      const onlyGetter = isFunction(getterOrOptions);
      let getter;
      let setter;
      if (onlyGetter) {
          getter = getterOrOptions;
          setter = () => { };
      }
      else {
          getter = getterOrOptions.get;
          setter = getterOrOptions.set;
      }
      return new ComputedRefImpl(getter, setter);
  }

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\reactivity\src\ref.ts
   * @Date         : 2023-01-04 14:16:27
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-05 09:09:25
   */
  class RefImpl {
      constructor(_rawValue) {
          this._rawValue = _rawValue;
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
  function ref(value) {
      return createRef(value);
  }

  exports.computed = computed;
  exports.effect = effect;
  exports.reactive = reactive;
  exports.ref = ref;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
