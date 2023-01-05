/*
 * @Description  :
 * @Author       : chenguo666
 * @FilePath     : \vue3_sourceCode_learning\packages\shared\src\index.ts
 * @Date         : 2022-12-28 19:35:48
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-04 13:17:09
 */
export function isObject(value: unknown): value is Record<any, any> {
  return typeof value === "object" && value !== null;
}
export function isFunction(value): boolean {
  return typeof value === "function";
}
