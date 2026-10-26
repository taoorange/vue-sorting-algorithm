import type { Step } from './types'

/**
 * 归并排序步骤生成。
 * 拆半递归后归并写回原数组；每次写回记为 write。
 */
export function mergeSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []

  /** 合并已排序的 [lo, mid] 与 [mid+1, hi] 写回 a */
  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    let i = 0
    let j = 0
    let k = lo
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        a[k] = left[i]
        steps.push({ type: 'write', i: k, value: left[i] })
        i++
      } else {
        a[k] = right[j]
        steps.push({ type: 'write', i: k, value: right[j] })
        j++
      }
      k++
    }
    while (i < left.length) {
      a[k] = left[i]
      steps.push({ type: 'write', i: k, value: left[i] })
      i++
      k++
    }
    while (j < right.length) {
      a[k] = right[j]
      steps.push({ type: 'write', i: k, value: right[j] })
      j++
      k++
    }
  }

  /** 递归排序闭区间 [lo, hi] */
  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  if (a.length > 0) sort(0, a.length - 1)
  return steps
}
