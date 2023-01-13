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
  } else {
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
  } else {
    const name = key.slice(2).toLowerCase(); // eventName
    if (nextValue) {
      const invoker = (invokers[key] = createInvoker(nextValue));
      el.addEventListener(name, invoker);
    } else if (exisitingInvoker) {
      el.removeEventListener(name, exisitingInvoker);
      invokers[key] = undefined;
    } else {
      // 压根没绑定过事件 不需要删除
    }
  }
}
function patchAttr(el, key, value) {
  if (value === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}
export const patchProp = (el, key, prevValue, nextValue) => {
  if (key === "class") {
    patchClass(el, nextValue);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
};
