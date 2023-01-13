import { isObject } from "@vue/shared";
import { isVnode, createVNode } from "./createVnode";

/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\runtime-core\src\h.ts
 * @Date         : 2023-01-09 16:03:51
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-10 09:50:10
 */
export function h(type, propsOrChildren, children) {
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
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVnode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
// 1:22:43
