/**
 * 可视化用的单步操作：
 * - swap：交换下标 i、j 的值
 * - write：把 value 写入下标 i（插入移位、归并写回等）
 */
export type Step =
  | { type: 'swap'; i: number; j: number }
  | { type: 'write'; i: number; value: number }

/**
 * 按步骤回放数组，返回最终结果。
 * 用于 verify 脚本校验：applySteps 后应等于升序。
 */
export function applySteps(arr: number[], steps: Step[]): number[] {
  const a = [...arr]
  for (const step of steps) {
    if (step.type === 'swap') {
      const t = a[step.i]
      a[step.i] = a[step.j]
      a[step.j] = t
    } else {
      a[step.i] = step.value
    }
  }
  return a
}
