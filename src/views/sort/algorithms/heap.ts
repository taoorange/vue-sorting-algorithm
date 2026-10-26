import type { Step } from './types'

/**
 * 堆排序步骤生成。
 * 建大顶堆后反复取出堆顶与末尾交换并下沉；交换记为 swap。
 */
export function heapSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  const n = a.length

  function swap(i: number, j: number) {
    if (i === j) return
    const t = a[i]
    a[i] = a[j]
    a[j] = t
    steps.push({ type: 'swap', i, j })
  }

  /** 在长度 size 的堆上，把 index 下沉到正确位置 */
  function siftDown(index: number, size: number) {
    let i = index
    while (true) {
      const left = i * 2 + 1
      const right = left + 1
      let largest = i
      if (left < size && a[left] > a[largest]) largest = left
      if (right < size && a[right] > a[largest]) largest = right
      if (largest === i) break
      swap(i, largest)
      i = largest
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(i, n)
  }
  for (let end = n - 1; end > 0; end--) {
    swap(0, end)
    siftDown(0, end)
  }
  return steps
}
