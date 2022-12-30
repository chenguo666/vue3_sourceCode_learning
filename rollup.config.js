/*
 * @Description  :
 * @Author       : chenguo666
 * @FilePath     : \vue3 pnpm\rollup.config.js
 * @Date         : 2022-12-29 19:27:27
 * @LastEditors  : chenguo666 cg1305378470@163.com
 * @LastEditTime : 2022-12-30 19:42:22
 */
import ts from "rollup-plugin-typescript2"; // 解析ts
import json from "@rollup/plugin-json"; // 解析json
import { nodeResolve } from "@rollup/plugin-node-resolve"; // 解析第三方插件
import path from "path"; // 处理路径
import commonjs from "@rollup/plugin-commonjs";

const packageFormats = process.env.FORMATS && process.env.FORMATS.split(",");
const scourcemap = process.env.SOURCE_MAP;
// const target = process.env.TARGET;
const packagesDir = path.resolve(__dirname, "packages");
const packageDir = path.resolve(packagesDir, process.env.TARGET);
// console.log(packageFormats, scourcemap, target);
const name = path.basename(packageDir);
const resolve = (p) => path.resolve(packageDir, p); // 以打包的目录解析
const pkg = require(resolve("package.json"));
console.log("pkg", pkg);
const outputConfig = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};
// const packageConfigs = packageFormats || pkg.buildOptions.formats;
const packageConfigs = pkg.buildOptions.formats;
function createConfig(format, output) {
  output.scourcemap = scourcemap;
  // output.exports = "named";
  let external = []; //那些模块不需要打包
  if (format === "global") {
    output.name = pkg.buildOptions.name;
  } else {
    external = [...Object.keys(pkg.dependencies)];
  }
  return {
    input: resolve(`src/index.ts`),
    output,
    external,
    plugins: [json(), ts(), commonjs(), nodeResolve()],
  };
}
// 返回数组 进行依次打包
export default packageConfigs.map((format) =>
  createConfig(format, outputConfig[format])
);
// 1:00:56
// 1:22:01
