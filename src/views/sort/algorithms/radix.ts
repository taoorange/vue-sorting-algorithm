import type { Step } from './types'

/**
 * 基数排序步骤生成（LSD，基数 10，适用于非负整数）。
 * 按个位→更高位做稳定计数写回；每次写回记为 write。
 */
export function radixSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  if (a.length === 0) return steps

  let max = a[0]
  for (const v of a) {
    if (v > max) max = v
  }
  if (max < 0) return steps

  /** 按某一位（exp = 1, 10, 100…）稳定计数排序写回 a */
  function countingByDigit(exp: number) {
    const n = a.length
    const output = new Array<number>(n)
    const count = new Array(10).fill(0)
    for (let i = 0; i < n; i++) {
      const d = Math.floor(a[i] / exp) % 10
      count[d] += 1
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1]
    for (let i = n - 1; i >= 0; i--) {
      const d = Math.floor(a[i] / exp) % 10
      output[--count[d]] = a[i]
    }
    for (let i = 0; i < n; i++) {
      a[i] = output[i]
      steps.push({ type: 'write', i, value: output[i] })
    }
  }

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingByDigit(exp)
  }
  return steps
}
