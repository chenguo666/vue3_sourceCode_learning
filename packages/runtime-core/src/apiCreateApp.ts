import { createVNode } from "./createVnode";

/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\runtime-core\src\apiCreateApp.ts
 * @Date         : 2023-01-06 14:20:20
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-09 13:14:47
 */

export function createAppAPI(render) {
  return (rootComponent, rootProps) => {
    let isMounted = false;
    const app = {
      mount(container) {
        // console.log(renderOptions, rootComponent, rootProps, container);
        // render(vnode, container);
        // 将虚拟节点转化为真实节点
        // 1.创造组件虚拟节点
        let vnode = createVNode(rootComponent, rootProps); // h函数
        // console.log(vnode);

        render(vnode, container);
        if (!isMounted) {
          isMounted = true;
        }
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
