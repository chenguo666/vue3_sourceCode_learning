/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\runtime-core\src\createVnode.ts
 * @Date         : 2023-01-06 15:39:48
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-10 13:59:55
 */
import { isObject, isString, ShapeFlags } from "@vue/shared";

export function createVNode(type, props, children = null) {
  const ShapeFlag = isObject(type)
    ? ShapeFlags.COMPONENT
    : isString(type)
    ? ShapeFlags.ELEMENT
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
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN;
  }
  return vnode;
}
export function isVnode(vnode) {
  return !!vnode.__v_isVnode;
}
export const Text = Symbol();
export function normalizeVnode(vnode) {
  if (isObject(vnode)) {
    return vnode;
  }
  return createVNode(Text, null, String(vnode));
}
export function isSameVnodeType(n1, n2) {
  // 比较类型 key 是否一致
  return n1.type === n2.type && n1.key === n2.key;
}
