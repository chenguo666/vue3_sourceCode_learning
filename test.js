/*
 * @Description  :
 * @Author       : fruitchan
 * @FilePath     : \vue3_sourceCode_learning\test.js
 * @Date         : 2023-01-12 11:21:36
 * @LastEditors  : fruitchan 1305378470@qq.com
 * @LastEditTime : 2023-01-13 09:27:25
 */
// 1 默认最好的情况 序列是递增的
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

// 二刷
