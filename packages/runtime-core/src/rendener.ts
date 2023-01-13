import { ReactiveEffect } from "@vue/reactivity";
import { ShapeFlags } from "@vue/shared";
import { createAppAPI } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { isSameVnodeType, normalizeVnode } from "./createVnode";
function getSequence(arr) {
  let len = arr.length;
  const result = [0]; // 放的是索引
  let lastIndex;
  let start;
  let p = arr.slice(0); // 记录前驱节点的索引
  let end;
  let middle;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      lastIndex = result[result.length - 1]; // 获取结果集中的最后一个
      if (arr[lastIndex] < arrI) {
        // 记录前一个人的索引
        p[i] = lastIndex;
        // 当前结果集中的最后一个和这个比较
        result.push(i);
        continue;
      }
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0; // 中间索引
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1];
        result[start] = i;
      }
    }
  }
  console.log(result);
  let i = result.length; // 拿到最后一个开始向前追溯
  let last = result[i - 1];
  while (i-- > 0) {
    result[i] = last;
    last = p[last];
  }
  return result;
}

export function crateRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = renderOptions;
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
      } else {
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
    } else {
      // 组件更新
    }
  };
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVnode(children[i]));
      patch(null, child, container);
    }
  };
  const mountElement = (vnode, container, anchor) => {
    let { type, props, ShapeFlag, children } = vnode;
    let el = (vnode.el = hostCreateElement(type));
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }
    // 处理属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    hostInsert(el, container, anchor);
  };
  const patchProps = (oldProps, newProps, el) => {
    if (oldProps === newProps) return;
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
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  const patchKeyedChildren = (c1, c2, container) => {
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    let i = 0; // 从头开始比较
    // sync from start 从开头开始一个个比较
    while (i <= e1 && i <= e2) {
      // i 和新久列表重合 说明比较完毕
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnodeType(n1, n2)) {
        // 如果俩个节点是相同节点 则需递归比较孩子和自身属性
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }
    // sync from end
    while (i <= e1 && i <= e2) {
      // i 和新久列表重合 说明比较完毕
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnodeType(n1, n2)) {
        // 如果俩个节点是相同节点 则需递归比较孩子和自身属性
        patch(n1, n2, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;

        while (i <= e2[i]) {
          patch(null, c2[i], container, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }
    // unknown
    const s1 = i; // s1=>e1 老的孩子列表
    const s2 = i; // s2=>e2 新的孩子列表
    const ketToNewIndexMap = new Map();
    for (let i = 0; i < e2; i++) {
      const child = c2[i];
      ketToNewIndexMap.set(child.key, i);
    }
    const toBepatched = e2 - s2 + 1;
    const newIndexToOldMapIndex = new Array(toBepatched).fill(0);

    for (let i = 0; i < e1; i++) {
      const prevChild = c1[i];
      let newIndex = ketToNewIndexMap.get(prevChild.key);
      if (newIndex === undefined) {
        unmount(prevChild);
      } else {
        newIndexToOldMapIndex[newIndex - s2] - i + 1; // 保证填得不是0
        patch(prevChild, c2[newIndex], container);
      }
    }
    let queue = getSequence(newIndexToOldMapIndex); // 求出 队列
    console.log(queue);
    let j = queue.length - 1;
    for (let i = toBepatched - 1; i >= 0; i--) {
      let lastIndex = s1 + i; //h得索引
      let lastChild = c2[lastIndex];
      let anchor = lastIndex + 1 < c2.length ? c2[lastIndex + 1].el : null;
      if (newIndexToOldMapIndex[i] == 0) {
        patch(null, lastChild, container, anchor); // 创建一个h插入到f得前面
      } else {
        // 优化 可能有节点不需要移动 但是还是插入了
        // 性能消耗  最长递增序列 减少dom的消耗
        if (i !== queue[j]) {
          hostInsert(lastChild.el, container, anchor);
        } else {
          j--; // 元素不需要移动了
        }
      }
    }
  };
  const patchChildren = (n1, n2, el) => {
    const c1 = n1 && n1.children;
    const c2 = n2 && n2.children;
    // c1 c2 儿子有哪些类型
    // 1 之前是数组 现在是文本 删除老节点 用新的文本替换
    // 2 之前是数组 现在也是数组 比较俩个儿字列表的差异 diff算法
    // 3 之前是文本 现在是空 直接删除老的
    // 4 之前是文本 现在也是文本 直接更新文本
    // 5 之前是文本 现在是数组 直接删除文本 新增儿字
    // 6 之前是空 现在是文本
    const prevShapFlag = n1.ShapFlag;
    const ShapeFlag = n2.ShapFlag;

    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1); // 1
      }
      if (c1 !== c2) {
        // 4
        hostSetElementText(el, c2);
      }
    } else {
      // 现在是数组
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 比对俩个数组的差异
          patchKeyedChildren(c1, c2, el);
        } else {
          // 之前是数组 现在不是数组 空文本
          unmountChildren(c1); //
        }
      } else {
        // 之前是文本
        if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
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
    patchChildren(n1, n2, el);
  };
  const processElement = (n1, n2, container, anchor) => {
    // 组件对应返回值的初始化
    if (n1 == null) {
      // 初始化
      mountElement(n2, container, anchor);
    } else {
      // diff
      patchElement(n1, n2); // 更新俩个元素间的差异
    }
  };
  const processText = (n1, n2, container) => {
    if (n1 === null) {
      // 文本初始化
      console.log(n2, container);
      let textNode = hostCreateText(n2.children);
      n2.el = textNode;
      hostInsert(textNode, container);
    }
  };
  const unmount = (vnode) => {
    hostRemove(vnode.el); // 删除真实节点即可
  };
  const patch = (n1, n2, container, anchor = null) => {
    // 俩个元素完全一样
    if (n1 && !isSameVnodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    // 元素前后不一致 删除老的元素 替换成新元素

    if (n1 == n2) return;
    const { type, ShapeFlag } = n2;

    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (ShapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container);
        } else if (ShapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
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

// p5 0:08:46
// p5 01:42:06
