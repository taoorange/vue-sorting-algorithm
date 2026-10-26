import type { Step } from './types'

/**
 * 计数排序步骤生成（非负整数）。
 * 统计频次后按序写回；写回记为 write。空数组直接返回。
 */
export function countingSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  if (a.length === 0) return steps

  let min = a[0]
  let max = a[0]
  for (const v of a) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const offset = -min
  const count = new Array(max - min + 1).fill(0)
  for (const v of a) count[v + offset] += 1

  let idx = 0
  for (let v = min; v <= max; v++) {
    let c = count[v + offset]
    while (c-- > 0) {
      a[idx] = v
      steps.push({ type: 'write', i: idx, value: v })
      idx++
    }
  }
  return steps
}
