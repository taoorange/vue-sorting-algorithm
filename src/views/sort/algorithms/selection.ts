import type { Step } from './types'

/**
 * 选择排序步骤生成。
 * 每轮在未排序区间找最小下标，与区间头 swap（若不同）。
 */
export function selectionSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  for (let i = 0; i < a.length; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j
    }
    if (min !== i) {
      const t = a[i]
      a[i] = a[min]
      a[min] = t
      steps.push({ type: 'swap', i, j: min })
    }
  }
  return steps
}
