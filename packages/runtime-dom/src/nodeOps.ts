/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\runtime-dom\src\nodeOps.ts
 * @Date         : 2023-01-05 15:58:08
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-05 16:09:17
 */
export const nodeOps = {
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
