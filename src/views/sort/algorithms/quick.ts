import type { Step } from './types'

/**
 * 快速排序步骤生成。
 * 以区间末尾为基准分区，再递归左右；交换记为 swap。
 */
export function quickSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []

  /** 交换 a[i] 与 a[j] 并记录一步 */
  function swap(i: number, j: number) {
    if (i === j) return
    const t = a[i]
    a[i] = a[j]
    a[j] = t
    steps.push({ type: 'swap', i, j })
  }

  /** 分区：小于 pivot 的靠左，返回 pivot 最终下标 */
  function partition(lo: number, hi: number): number {
    const pivot = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivot) {
        swap(i, j)
        i++
      }
    }
    swap(i, hi)
    return i
  }

  /** 递归排序闭区间 [lo, hi] */
  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  if (a.length > 0) sort(0, a.length - 1)
  return steps
}
