/**
 * 排序算法步骤生成器统一出口。
 * 页面只从此处导入，避免直接依赖各算法文件路径。
 *
 * 每个 *SortSteps(arr) 对副本跑算法，返回 Step[]：
 * - swap：交换下标 i、j
 * - write：把 value 写入下标 i
 * 可视化播放器按 Step 逐步改柱高并统计移动次数。
 */

/** 步骤类型：交换 / 写入 */
export type { Step } from './types'

/** 按步骤回放数组（校验用） */
export { applySteps } from './types'

/** 冒泡排序步骤 */
export { bubbleSortSteps } from './bubble'

/** 选择排序步骤 */
export { selectionSortSteps } from './selection'

/** 插入排序步骤 */
export { insertionSortSteps } from './insertion'

/** 快速排序步骤 */
export { quickSortSteps } from './quick'

/** 归并排序步骤 */
export { mergeSortSteps } from './merge'

/** 希尔排序步骤 */
export { shellSortSteps } from './shell'

/** 堆排序步骤 */
export { heapSortSteps } from './heap'

/** 计数排序步骤 */
export { countingSortSteps } from './counting'

/** 基数排序步骤 */
export { radixSortSteps } from './radix'

/** 桶排序步骤 */
export { bucketSortSteps } from './bucket'
