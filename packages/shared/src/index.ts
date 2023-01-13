/*
 * @Description  :
 * @Author       : chenguo666
 * @FilePath     : \vue3_sourceCode_learning\packages\shared\src\index.ts
 * @Date         : 2022-12-28 19:35:48
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-09 13:56:40
 */
export function isObject(value: unknown): value is Record<any, any> {
  return typeof value === "object" && value !== null;
}
export function isFunction(value): boolean {
  return typeof value === "function";
}
export const enum ShapeFlags {
  ELEMENT = 1, // 元素
  FUNCTIONAL_COMPONENT = 1 << 1, //函数式组件
  STATEFUL_COMPONENT = 1 << 2, //普通组件
  TEXT_CHILDREN = 1 << 3, // 孩子是文本
  ARRAY_CHILDREN = 1 << 4, // 孩子是数组
  SLOTS_CHILDREN = 1 << 5, // 组件插槽
  TELEPORT = 1 << 6, // teleport组件
  SUSPENSE = 1 << 7, // suspense 组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 组件
}
export function isString(value) {
  return typeof value === "string";
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (value, key) => hasOwnProperty.call(value, key);
