import type { Step } from './types'

/**
 * 希尔排序步骤生成。
 * 按递减间隔做插入排序；交换相邻间隔元素记为 swap。
 */
export function shellSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  const n = a.length
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let j = i
      while (j >= gap && a[j - gap] > a[j]) {
        const t = a[j - gap]
        a[j - gap] = a[j]
        a[j] = t
        steps.push({ type: 'swap', i: j - gap, j })
        j -= gap
      }
    }
  }
  return steps
}
