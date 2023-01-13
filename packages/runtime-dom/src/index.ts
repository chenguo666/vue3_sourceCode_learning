/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\packages\runtime-dom\src\index.ts
 * @Date         : 2023-01-05 13:28:45
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-09 13:15:00
 */
// 需要涵盖 dom 和属性操作的api 将这些api 传入core
import { crateRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
const renderOptions = Object.assign(nodeOps, { patchProp });
// console.log(renderOptions);

export const createApp = (component, rootProps = null) => {
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
export * from "@vue/runtime-core"; // 导出这个模块的所有代码
// 0：21：34
// 0：30：19
