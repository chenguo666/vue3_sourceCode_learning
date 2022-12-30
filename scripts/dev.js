/*
 * @Description  :
 * @Author       : chenguo666
 * @FilePath     : \vue3 pnpm\scripts\dev.js
 * @Date         : 2022-12-28 19:49:54
 * @LastEditors  : chenguo666 cg1305378470@163.com
 * @LastEditTime : 2022-12-30 19:19:50
 */
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
const execa = require("execa");
// console.log(args);

// 37:17
const target = args._.length ? args._[0] : "reactivity";
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
