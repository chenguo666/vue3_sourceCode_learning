/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\vue-com\vue2响应式.ts
 * @Date         : 2023-01-14 13:23:56
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-14 13:38:09
 */
// 弊端 不能监听额外添加额外属性或修改额外添加的属性的变化
// 定义的对象不能监听根据自身数组下标修改数组元素的变化
export function defineReactive(data, key, val) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
    },
  });
}
// use
let obj = {};
defineReactive(obj, "name", "ssss");
// obj.name = "sadf";
// obj.age = 12;

let targetProxy = { name: "sapper" };
let objProxy = new Proxy(targetProxy, {
  get(target, key) {
    return target[key];
  },
  set(target, key, newVal) {
    if (target[key] === newVal) {
      return;
    }
    target[key] = newVal;
    return target[key];
  },
});
