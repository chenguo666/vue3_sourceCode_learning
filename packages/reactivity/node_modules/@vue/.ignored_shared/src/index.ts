/*
 * @Description  :
 * @Author       : chenguo666
 * @FilePath     : \vue3 pnpm\packages\shared\src\index.ts
 * @Date         : 2022-12-28 19:35:48
 * @LastEditors  : chenguo666 cg1305378470@163.com
 * @LastEditTime : 2022-12-28 19:42:56
 */
export function isObject(value: unknown): value is Record<any, any> {
  return typeof value === "object" && value !== null;
}
