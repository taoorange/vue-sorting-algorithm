import type { Step } from './types'

/**
 * 插入排序步骤生成。
 * 把当前元素插入左侧已排序区间；移位与落位均记为 write。
 */
export function insertionSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]
      steps.push({ type: 'write', i: j + 1, value: a[j] })
      j--
    }
    a[j + 1] = key
    steps.push({ type: 'write', i: j + 1, value: key })
  }
  return steps
}
