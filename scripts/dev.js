/*
 * @Description  :
 * @Author       : chenguo666
 * @FilePath     : \vue3_sourceCode_learning\scripts\dev.js
 * @Date         : 2022-12-28 19:49:54
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-05 13:32:06
 */
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
const execa = require("execa");
// console.log(args);

// 37:17
// const target = args._.length ? args._[0] : "reactivity";
const target = args._.length ? args._[0] : "runtime-dom";
const formats = args.f || "global";
const sourcemap = args.s || false;

execa(
  "rollup",
  [
    "-wc",
    "--environment",
    [
      `TARGET:${target}`,
      `FORMATS:${formats}`,
      sourcemap ? `SOURCE_MAP:true` : ``,
    ]
      .filter(Boolean)
      .join(","),
  ],
  {
    stdio: "inherit",
  }
);
