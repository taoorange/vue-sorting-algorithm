import type { Step } from './types'

/**
 * 冒泡排序步骤生成。
 * 对数组副本逐轮相邻比较，逆序则 swap；返回完整 Step 列表供动画播放。
 */
export function bubbleSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  for (let n = a.length; n > 1; n--) {
    for (let i = 0; i < n - 1; i++) {
      if (a[i] > a[i + 1]) {
        const t = a[i]
        a[i] = a[i + 1]
        a[i + 1] = t
        steps.push({ type: 'swap', i, j: i + 1 })
      }
    }
  }
  return steps
}
