import { reactive } from "@vue/reactivity";
import { hasOwn, isFunction, isObject } from "@vue/shared";

export function createComponentInstance(vnode) {
  const type = vnode.type; // 用户自己传入的属性
  const instance = {
    vnode, // 实例对应的虚拟节点
    type, // 组件对象
    subTree: null, // 组件渲染内容
    ctx: {}, // 组件上下文
    props: {}, // 组件属性
    attrs: {}, // 除了props中的属性
    slots: {}, // 组件的插槽
    setupState: {}, // setup 返回的状态
    propsOptions: type.props, // 属性的选项
    proxy: null, // 实例的代理对象
    render: null, // 组件的渲染函数
    emit: null, // 事件触发
    exposed: {}, // 暴露的方法
    isMounted: false, // 是否挂载完成
  };
  instance.ctx = { _: instance }; // 后续对其进行代理
  return instance;
}
export function initProps(instance, rawProps) {
  const props = {};
  const attrs = {};
  const options = Object.keys(instance.propsOptions); // 用户注册过的
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (options.includes(key)) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs; // 非响应式的
}
export function createSetupContext(instance) {
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
    } else if (hasOwn(props, key)) {
      return props[key];
    } else {
      // ...
    }
  },
  set({ _: instance }, key, value) {
    const { setupState, props } = instance; // 属性不修改
    if (hasOwn(setupState, key)) {
      return (setupState[key] = value);
    } else if (hasOwn(props, key)) {
      console.log("props are readonly");

      return false;
    } else {
      // ...
    }
    return true;
  },
};
export function setupStatefullComponent(instance) {
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
    } else if (isObject(setupResult)) {
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
export function setupComponent(instance) {
  const { props, children } = instance.vnode;
  // 组件props 初始化 attrs 也要初始化
  initProps(instance, props);
  //   console.log(instance);
  // 插槽初始化
  // initSlots(instance, children);
  //
  setupStatefullComponent(instance); // 调用setup函数拿到返回的值
}
