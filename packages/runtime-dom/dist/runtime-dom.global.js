var VueRuntimeDOM = (function (exports) {
  'use strict';

  /*
   * @Description  :
   * @Author       : chenguo666
   * @FilePath     : \vue3_sourceCode_learning\packages\shared\src\index.ts
   * @Date         : 2022-12-28 19:35:48
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-09 13:56:40
   */
  function isObject(value) {
      return typeof value === "object" && value !== null;
  }
  function isFunction(value) {
      return typeof value === "function";
  }
  function isString(value) {
      return typeof value === "string";
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (value, key) => hasOwnProperty.call(value, key);

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\runtime-core\src\createVnode.ts
   * @Date         : 2023-01-06 15:39:48
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-10 13:59:55
   */
  function createVNode(type, props, children = null) {
      const ShapeFlag = isObject(type)
          ? 6 /* ShapeFlags.COMPONENT */
          : isString(type)
              ? 1 /* ShapeFlags.ELEMENT */
              : 0;
      const vnode = {
          __v_isVnode: true,
          type,
          ShapeFlag,
          props,
          children,
          key: props && props.key,
          component: null,
          el: null, // 虚拟节点对应得真实节点
      };
      if (children) {
          vnode.ShapeFlag |= isString(children)
              ? 8 /* ShapeFlags.TEXT_CHILDREN */
              : 16 /* ShapeFlags.ARRAY_CHILDREN */;
      }
      return vnode;
  }
  function isVnode(vnode) {
      return !!vnode.__v_isVnode;
  }
  const Text$1 = Symbol();
  function normalizeVnode(vnode) {
      if (isObject(vnode)) {
          return vnode;
      }
      return createVNode(Text$1, null, String(vnode));
  }
  function isSameVnodeType(n1, n2) {
      // 比较类型 key 是否一致
      return n1.type === n2.type && n1.key === n2.key;
  }

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\runtime-core\src\h.ts
   * @Date         : 2023-01-09 16:03:51
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-10 09:50:10
   */
  function h(type, propsOrChildren, children) {
      console.log(type, propsOrChildren, children);
      // h('div',{color:red})
      // h('div',h('span'))
      // h('div','span')
      // h('div',['span','dfg'])
      let l = arguments.length;
      if (l === 2) {
          if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
              if (isVnode(propsOrChildren)) {
                  return createVNode(type, null, [propsOrChildren]);
              }
              return createVNode(type, propsOrChildren);
          }
          else {
              return createVNode(type, null, propsOrChildren);
          }
      }
      else {
          if (l > 3) {
              children = Array.prototype.slice.call(arguments, 2);
          }
          else if (l === 3 && isVnode(children)) {
              children = [children];
          }
          return createVNode(type, propsOrChildren, children);
      }
  }
  // 1:22:43

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

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\runtime-core\src\apiCreateApp.ts
   * @Date         : 2023-01-06 14:20:20
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-09 13:14:47
   */
  function createAppAPI(render) {
      return (rootComponent, rootProps) => {
          const app = {
              mount(container) {
                  // console.log(renderOptions, rootComponent, rootProps, container);
                  // render(vnode, container);
                  // 将虚拟节点转化为真实节点
                  // 1.创造组件虚拟节点
                  let vnode = createVNode(rootComponent, rootProps); // h函数
                  // console.log(vnode);
                  render(vnode, container);
              },
              //   use() {},
              //   mixin() {},
              //   component() {},
              //   directive() {},
              //   unmoint() {},
              //   provide() {},
          };
          return app;
      };
  }

  function createComponentInstance(vnode) {
      const type = vnode.type; // 用户自己传入的属性
      const instance = {
          vnode,
          type,
          subTree: null,
          ctx: {},
          props: {},
          attrs: {},
          slots: {},
          setupState: {},
          propsOptions: type.props,
          proxy: null,
          render: null,
          emit: null,
          exposed: {},
          isMounted: false, // 是否挂载完成
      };
      instance.ctx = { _: instance }; // 后续对其进行代理
      return instance;
  }
  function initProps(instance, rawProps) {
      const props = {};
      const attrs = {};
      const options = Object.keys(instance.propsOptions); // 用户注册过的
      if (rawProps) {
          for (const key in rawProps) {
              const value = rawProps[key];
              if (options.includes(key)) {
                  props[key] = value;
              }
              else {
                  attrs[key] = value;
              }
          }
      }
      instance.props = reactive(props);
      instance.attrs = attrs; // 非响应式的
  }
  function createSetupContext(instance) {
      return {
          attrs: instance.attrs,
          slots: instance.slots,
          emit: instance.emit,
          expost: (exposed) => {
              instance.exposed = exposed || {};
          },
      };
  }
  const PublicInstanceProxyHandlers = {
      get({ _: instance }, key) {
          const { setupState, props } = instance;
          if (hasOwn(setupState, key)) {
              return setupState[key];
          }
          else if (hasOwn(props, key)) {
              return props[key];
          }
          else ;
      },
      set({ _: instance }, key, value) {
          const { setupState, props } = instance; // 属性不修改
          if (hasOwn(setupState, key)) {
              return (setupState[key] = value);
          }
          else if (hasOwn(props, key)) {
              console.log("props are readonly");
              return false;
          }
          else ;
          return true;
      },
  };
  function setupStatefullComponent(instance) {
      // 核心组件的setup方法
      const Component = instance.type;
      const { setup } = Component;
      instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers); // proxy就是代理的上下文
      console.log(instance.proxy);
      if (setup) {
          const setupContext = createSetupContext(instance);
          let setupResult = setup(instance.props, setupContext); // 获取setup的返回值
          if (isFunction(setupResult)) {
              instance.render = setupResult; // 如果返回时函数 就是render
          }
          else if (isObject(setupResult)) {
              // 返回是对象
              instance.setupState = setupResult;
          }
      }
      if (!instance.render) {
          // 没有render
          // 如果没有render 写的是template 可能要模板编译
          instance.render = Component.render; // 如果setup没写render 就采用组件本身的render
      }
  }
  function setupComponent(instance) {
      const { props, children } = instance.vnode;
      // 组件props 初始化 attrs 也要初始化
      initProps(instance, props);
      //   console.log(instance);
      // 插槽初始化
      // initSlots(instance, children);
      //
      setupStatefullComponent(instance); // 调用setup函数拿到返回的值
  }

  function crateRenderer(renderOptions) {
      const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, } = renderOptions;
      const setupRenderEffect = (initialVnode, instance, container) => {
          // 创建渲染effect
          // 核心就是调用render 数据变化 就调用render
          const componentUpdateFn = () => {
              let { proxy } = instance; // render 中的参数
              if (!instance.isMounted) {
                  // 组件初始化
                  const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                  console.log(subTree);
                  // 真正渲染组件 其实渲染的是subTree
                  patch(null, subTree, container); // 渲染完后 subtree 会生成真实节点 挂载到subtree
                  initialVnode.el = subTree.el;
                  instance.isMounted = true;
              }
              else {
                  // 组件更新流程。。。
                  console.log("render");
                  // diff 算法比对差异
                  const prevTree = instance.subTree;
                  const nextTree = instance.render.call(proxy, proxy);
                  patch(prevTree, nextTree, container); // 比较俩个属性
              }
          };
          const effect = new ReactiveEffect(componentUpdateFn);
          // 默认调用update方法 就会执行componentUpdateFn
          const update = effect.run.bind(effect);
          update();
      };
      const mountComponent = (initialVnode, container) => {
          // console.log(initialVnode, container);
          // 1组件创造一个组件实例
          const instance = (initialVnode.component =
              createComponentInstance(initialVnode));
          // 2给组件实例赋值
          setupComponent(instance); // 给实例赋予属性
          //  调用render 实现组件渲染
          setupRenderEffect(initialVnode, instance, container); // 渲染effect
      };
      const processComponent = (n1, n2, container) => {
          if (n1 == null) {
              // 组件初始化
              mountComponent(n2, container);
          }
      };
      const mountChildren = (children, container) => {
          for (let i = 0; i < children.length; i++) {
              const child = (children[i] = normalizeVnode(children[i]));
              patch(null, child, container);
          }
      };
      const mountElement = (vnode, container) => {
          let { type, props, ShapeFlag, children } = vnode;
          let el = (vnode.el = hostCreateElement(type));
          if (ShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
              hostSetElementText(el, children);
          }
          else if (ShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
              mountChildren(children, el);
          }
          // 处理属性
          if (props) {
              for (const key in props) {
                  hostPatchProp(el, key, null, props[key]);
              }
          }
          hostInsert(el, container);
      };
      const patchProps = (oldProps, newProps, el) => {
          if (oldProps === newProps)
              return;
          for (const key in newProps) {
              const prev = oldProps[key];
              const next = newProps[key]; // 获取新老属性
              if (prev !== next) {
                  hostPatchProp(el, key, prev, next);
              }
          }
          for (const key in oldProps) {
              // 老的有 新的没有 移除老的
              if (!(key in newProps)) {
                  hostPatchProp(el, key, oldProps[key], null);
              }
          }
      };
      const patchElement = (n1, n2) => {
          // 相比较元素 元素一致 则复用
          let el = (n2.el = n1.el);
          const oldProps = n1.props || {};
          const newProps = n2.props || {};
          patchProps(oldProps, newProps, el);
          // 比较儿子 diff
      };
      const processElement = (n1, n2, container) => {
          // 组件对应返回值的初始化
          if (n1 == null) {
              // 初始化
              mountElement(n2, container);
          }
          else {
              // diff
              patchElement(n1, n2); // 更新俩个元素间的差异
          }
      };
      const processText = (n1, n2, container) => {
          if (n1 === null) {
              // 文本初始化
              console.log(n2, container);
              let textNode = hostCreateText(n2.children);
              hostInsert(textNode, container);
          }
      };
      const unmount = (vnode) => {
          hostRemove(vnode.el); // 删除真实节点即可
      };
      const patch = (n1, n2, container) => {
          // 俩个元素完全一样
          if (n1 && !isSameVnodeType(n1, n2)) {
              unmount(n1);
              n1 = null;
          }
          // 元素前后不一致 删除老的元素 替换成新元素
          if (n1 == n2)
              return;
          const { type, ShapeFlag } = n2;
          switch (type) {
              case Text:
                  processText(n1, n2, container);
                  break;
              default:
                  if (ShapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                      processComponent(n1, n2, container);
                  }
                  else if (ShapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                      processElement(n1, n2, container);
                  }
          }
      };
      const render = (vnode, container) => {
          // console.log(vnode, container);
          // 后续还有更新  patch 初次渲染 更新
          patch(null, vnode, container);
      };
      return {
          createApp: createAppAPI(render),
          render,
      };
  }

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\runtime-dom\src\nodeOps.ts
   * @Date         : 2023-01-05 15:58:08
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-05 16:09:17
   */
  const nodeOps = {
      insert: (child, parent, anchor = null) => {
          parent.insertBefore(child, anchor);
      },
      remove: (child) => {
          const parent = child.parent;
          if (parent) {
              parent.removeChild(child);
          }
      },
      createElement: (tag) => document.createElement(tag),
      createText: (text) => document.createTextNode(text),
      setElementText: (el, text) => (el.textContent = text),
      setText: (node, text) => (node.textContent = text),
      parentNode: (node) => node.parentNode,
      nextSibling: (node) => node.nextSibling,
      querySelector: (selector) => document.querySelector(selector),
  };

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\runtime-dom\src\patchProp.ts
   * @Date         : 2023-01-06 09:41:06
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-06 10:39:50
   */
  // 比对属性 diff 算法
  function patchClass(el, value) {
      if (value === null) {
          el.removeAttribute("class");
      }
      else {
          el.className = value;
      }
  }
  function patchStyle(el, prev, next) {
      const style = el.style;
      // 最新的全部放到元素上
      for (const key in next) {
          style[key] = next[key];
      }
      // 新的没有 但是老的有 将老的移除
      if (prev) {
          for (const key in prev) {
              if (prev[key] === null) {
                  style[key] = null;
              }
          }
      }
  }
  function createInvoker(value) {
      const invoker = (e) => {
          invoker.value(e);
      };
      invoker.value = value; // 存储这个变量 后续想换绑 可以直接更新value值
      return invoker;
  }
  function patchEvent(el, key, nextValue) {
      const invokers = el._vel || (el._vel = {}); // 在元素上绑定一个自定义属性 用来记录绑定得事件
      let exisitingInvoker = invokers[key];
      if (exisitingInvoker && nextValue) {
          // 换绑
          exisitingInvoker.value = nextValue;
      }
      else {
          const name = key.slice(2).toLowerCase(); // eventName
          if (nextValue) {
              const invoker = (invokers[key] = createInvoker(nextValue));
              el.addEventListener(name, invoker);
          }
          else if (exisitingInvoker) {
              el.removeEventListener(name, exisitingInvoker);
              invokers[key] = undefined;
          }
          else ;
      }
  }
  function patchAttr(el, key, value) {
      if (value === null) {
          el.removeAttribute(key);
      }
      else {
          el.setAttribute(key, value);
      }
  }
  const patchProp = (el, key, prevValue, nextValue) => {
      if (key === "class") {
          patchClass(el, nextValue);
      }
      else if (key === "style") {
          patchStyle(el, prevValue, nextValue);
      }
      else if (/^on[^a-z]/.test(key)) {
          patchEvent(el, key, nextValue);
      }
      else {
          patchAttr(el, key, nextValue);
      }
  };

  /*
   * @Description  :
   * @Author       : fruitchan
   * @FilePath     : \vue3_sourceCode_learning\packages\runtime-dom\src\index.ts
   * @Date         : 2023-01-05 13:28:45
   * @LastEditors  : fruitchan 1305378470@qq.com
   * @LastEditTime : 2023-01-09 13:15:00
   */
  const renderOptions = Object.assign(nodeOps, { patchProp });
  // console.log(renderOptions);
  const createApp = (component, rootProps = null) => {
      // 需要创建一个渲染器
      const { createApp } = crateRenderer(renderOptions);
      let app = createApp(component, rootProps);
      let { mount } = app;
      app.mount = function (container) {
          container = nodeOps.querySelector(container);
          container.innerHTML = "";
          mount(container);
      };
      return app;
  };
  // 0：21：34
  // 0：30：19

  exports.ReactiveEffect = ReactiveEffect;
  exports.computed = computed;
  exports.crateRenderer = crateRenderer;
  exports.createApp = createApp;
  exports.effect = effect;
  exports.h = h;
  exports.reactive = reactive;
  exports.ref = ref;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
