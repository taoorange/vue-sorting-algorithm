import type { Step } from './types'

/** 表示「已装进桶、槽位暂时为空」的占位高度，动画里柱子会缩没 */
const EMPTY_SLOT = 0

/**
 * 桶排序步骤生成。
 * 1) 逐个取走元素写入桶，同时把原下标写空（避免写回时左右出现重复高度）
 * 2) 桶内插入排序
 * 3) 按桶顺序写回原数组
 */
export function bucketSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  const n = a.length
  if (n === 0) return steps

  let min = a[0]
  let max = a[0]
  for (const v of a) {
    if (v < min) min = v
    if (v > max) max = v
  }
  if (min === max) {
    for (let i = 0; i < n; i++) {
      steps.push({ type: 'write', i, value: a[i] })
    }
    return steps
  }

  const bucketCount = Math.max(1, Math.floor(Math.sqrt(n)))
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  const span = max - min

  // 分发：元素进桶 + 原槽位清空，动画才不会「一柱分身」
  for (let i = 0; i < n; i++) {
    const v = a[i]
    let bi = Math.floor(((v - min) / span) * (bucketCount - 1))
    if (bi < 0) bi = 0
    if (bi >= bucketCount) bi = bucketCount - 1
    buckets[bi].push(v)
    a[i] = EMPTY_SLOT
    steps.push({ type: 'write', i, value: EMPTY_SLOT })
  }

  for (const bucket of buckets) {
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i]
      let j = i - 1
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j]
        j--
      }
      bucket[j + 1] = key
    }
  }

  let idx = 0
  for (const bucket of buckets) {
    for (const v of bucket) {
      a[idx] = v
      steps.push({ type: 'write', i: idx, value: v })
      idx++
    }
  }
  return steps
}
