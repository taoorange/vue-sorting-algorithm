<template>
  <div class="page">
    <header>
      <h1>排序算法可视化</h1>
      <p class="subtitle">一步一动画 · 统计移动次数与耗时（含动画）</p>
    </header>

    <section class="panel">
      <div class="row">
        <input v-model.number="countInput" type="number" min="2" :max="MAX_BAR_COUNT" />
        <button class="btn btn-primary" type="button" @click="generateBars">生成柱子</button>
        <button class="btn" type="button" :disabled="!hasBars" @click="shuffleBars">重新打乱</button>
        <button class="btn btn-danger" type="button" :disabled="!running" @click="stopSort">停止</button>
        <span class="speed-label">速度</span>
        <select v-model.number="speedMs" class="speed-select" aria-label="动画速度">
          <option v-for="opt in SPEED_OPTIONS" :key="opt.ms" :value="opt.ms">
            {{ opt.label }}
          </option>
        </select>
        <button
          class="btn complexity-trigger"
          type="button"
          @click="complexityDrawerOpen = true"
        >
          复杂度
        </button>
      </div>
      <p v-if="countError" class="error">{{ countError }}</p>
      <div class="row">
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('bubble')">冒泡</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('selection')">选择</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('insertion')">插入</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('quick')">快速</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('merge')">归并</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('shell')">希尔</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('heap')">堆</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('counting')">计数</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('radix')">基数</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('bucket')">桶</button>
      </div>
    </section>

    <section class="panel stats">
      <div>
        <div class="stat-label">状态</div>
        <div class="stat-value">{{ status }}</div>
      </div>
      <div>
        <div class="stat-label">柱子数量</div>
        <div class="stat-value">{{ hasBars ? bars.length : '—' }}</div>
      </div>
      <div>
        <div class="stat-label">移动次数</div>
        <div class="stat-value">{{ moves }}</div>
      </div>
      <div>
        <div class="stat-label">耗时（含动画）</div>
        <div class="stat-value">{{ elapsedText }}</div>
      </div>
    </section>

    <section
      ref="chartEl"
      class="panel chart"
      :style="{
        '--bar-width': barWidthPx + 'px',
        '--bar-gap': BAR_GAP + 'px',
        '--bar-transition': Math.max(30, Math.round(speedMs * 0.75)) + 'ms',
      }"
    >
      <div v-if="!hasBars" class="chart-empty">输入数量后点击生成柱子</div>
      <template v-else>
        <div
          v-for="(bar, index) in bars"
          :key="bar.id"
          class="bar"
          :class="{ active: activeIndexes.includes(index) }"
          :style="{ height: bar.height + 'px' }"
        />
      </template>
    </section>

    <Teleport to="body">
      <div
        v-if="complexityDrawerOpen"
        class="drawer-mask"
        @click="complexityDrawerOpen = false"
      />
      <aside
        class="drawer"
        :class="{ 'drawer-open': complexityDrawerOpen }"
        aria-label="算法复杂度"
      >
        <div class="drawer-header">
          <h2 class="drawer-title">算法复杂度</h2>
          <button class="btn drawer-close" type="button" @click="complexityDrawerOpen = false">
            关闭
          </button>
        </div>
        <div class="drawer-body">
          <table class="complexity-table">
            <thead>
              <tr>
                <th>算法</th>
                <th>最好时间</th>
                <th>平均时间</th>
                <th>最坏时间</th>
                <th>空间</th>
                <th>稳定性</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in COMPLEXITY_ROWS" :key="row.name">
                <td>{{ row.name }}</td>
                <td>{{ row.best }}</td>
                <td>{{ row.average }}</td>
                <td>{{ row.worst }}</td>
                <td>{{ row.space }}</td>
                <td>{{ row.stable }}</td>
              </tr>
            </tbody>
          </table>
          <p class="drawer-note">k / d / r 分别为值域跨度、位数、基数；表中为教学常用口径。</p>
        </div>
      </aside>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  bubbleSortSteps,
  selectionSortSteps,
  insertionSortSteps,
  quickSortSteps,
  mergeSortSteps,
  shellSortSteps,
  heapSortSteps,
  countingSortSteps,
  radixSortSteps,
  bucketSortSteps,
  type Step,
} from './algorithms'

/** 柱子最小高度（px） */
const MIN_BAR_H = 4
/**
 * 柱宽下限（px）。200 根时总宽 ≈ 200*min + 199*gap。
 * 设为 14：约 2999px，常见超宽屏也会出现横向滚动，避免「全挤进一屏像只有一半」。
 */
const MIN_BAR_W = 14
/** 柱宽上限（px）；数量很少时避免单根过宽 */
const MAX_BAR_W = 28
/** 柱子间距（px） */
const BAR_GAP = 1
/** 允许生成的最大柱子数量 */
const MAX_BAR_COUNT = 500

/** 速度 1× 基准：每步间隔 40ms */
const SPEED_BASE_MS = 40
/** 可选每步间隔（ms）：40 / 120 / 240 / 400 */
const SPEED_MS_LIST = [40, 120, 240, 400] as const
/** 速度下拉选项：展示「毫秒 + 相对 40ms 的倍数」 */
const SPEED_OPTIONS = SPEED_MS_LIST.map((ms) => {
  const times = ms / SPEED_BASE_MS
  const label = times === 1 ? `${ms}ms（1×）` : `${ms}ms（${times}×慢）`
  return { ms, label }
})

/** 十种排序的复杂度对照（教学常用口径） */
const COMPLEXITY_ROWS = [
  {
    name: '冒泡',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: '稳定',
  },
  {
    name: '选择',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: '不稳定',
  },
  {
    name: '插入',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: '稳定',
  },
  {
    name: '快速',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    stable: '不稳定',
  },
  {
    name: '归并',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: '稳定',
  },
  {
    name: '希尔',
    best: 'O(n log n)',
    average: 'O(n^1.3)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: '不稳定',
  },
  {
    name: '堆',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    stable: '不稳定',
  },
  {
    name: '计数',
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n + k)',
    space: 'O(k)',
    stable: '稳定',
  },
  {
    name: '基数',
    best: 'O(d(n + r))',
    average: 'O(d(n + r))',
    worst: 'O(d(n + r))',
    space: 'O(n + r)',
    stable: '稳定',
  },
  {
    name: '桶',
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n²)',
    space: 'O(n + k)',
    stable: '稳定',
  },
] as const

/** 单根柱：槽位 id 固定，排序时只改 height */
type Bar = { id: number; height: number }
/** 播放状态文案 */
type Status = '未开始' | '进行中' | '已完成' | '已停止'

/** 用户输入的柱子数量；合法范围 2～500，默认 200 */
const countInput = ref(200)
/** 数量非法时的错误文案；空字符串表示无错 */
const countError = ref('')
/** 当前每步动画间隔（ms）；默认 240（6×慢） */
const speedMs = ref<(typeof SPEED_MS_LIST)[number]>(240)
/** 右侧复杂度抽屉是否打开 */
const complexityDrawerOpen = ref(false)
/** 柱状图容器 DOM，用于读取可用宽高 */
const chartEl = ref<HTMLElement | null>(null)

/** 当前柱子列表（高度乱序或排序中） */
const bars = ref<Bar[]>([])
/** 当前柱宽（px），随数量增多而变窄 */
const barWidthPx = ref(MIN_BAR_W)
/** 当前步骤高亮的下标（swap 涉及两个，write 涉及一个） */
const activeIndexes = ref<number[]>([])
/** 是否已生成过柱子；控制排序按钮可用性 */
const hasBars = ref(false)

/** 排序播放状态 */
const status = ref<Status>('未开始')
/** 已执行的 swap/write 步数 */
const moves = ref(0)
/** 耗时展示文案（含动画），未开始为「—」 */
const elapsedText = ref('—')
/** 是否正在播放排序动画 */
const running = ref(false)

/** 为 true 时当前播放循环应跳出 */
let abort = false
/** 播放世代号；新一轮播放递增，旧 async 循环发现不匹配则停 */
let playToken = 0

/** 算法名 → 步骤生成函数 */
const sortFns = {
  bubble: bubbleSortSteps,
  selection: selectionSortSteps,
  insertion: insertionSortSteps,
  quick: quickSortSteps,
  merge: mergeSortSteps,
  shell: shellSortSteps,
  heap: heapSortSteps,
  counting: countingSortSteps,
  radix: radixSortSteps,
  bucket: bucketSortSteps,
} as const

/** 排序按钮对应的算法名 */
type SortName = keyof typeof sortFns

/** 清空统计与高亮，回到「未开始」 */
function resetStats() {
  status.value = '未开始'
  moves.value = 0
  elapsedText.value = '—'
  activeIndexes.value = []
}

/** 请求打断当前播放循环 */
function abortRun() {
  abort = true
}

/** 打断播放并等待当前步进结束，再清 running / 高亮 */
async function stopCurrentPlay() {
  abortRun()
  await new Promise((r) => setTimeout(r, speedMs.value + 10))
  running.value = false
  activeIndexes.value = []
}

/** Fisher–Yates 原地打乱 */
function shuffleInPlace<T>(list: T[]) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = list[i]
    list[i] = list[j]
    list[j] = t
  }
}

/**
 * 按数量与容器宽度算柱宽。
 * 优先均分视口；窄到 MIN_BAR_W 后总宽超出容器，由横向滚动查看。
 */
function computeBarWidth(n: number, containerWidth: number) {
  const available = Math.max(0, containerWidth - BAR_GAP * Math.max(0, n - 1))
  const fill = Math.floor(available / n)
  return Math.min(MAX_BAR_W, Math.max(MIN_BAR_W, fill))
}

/**
 * 校验数量 → 按容器高度生成严格递增高度 → 打乱写入 bars。
 * 若正在排序会先中断；生成后打印排查日志。
 */
async function generateBars() {
  const n = Number(countInput.value)
  if (!Number.isInteger(n) || n < 2 || n > MAX_BAR_COUNT) {
    countError.value = `请输入 2～${MAX_BAR_COUNT} 的整数`
    return
  }
  countError.value = ''

  if (running.value) await stopCurrentPlay()

  await nextTick()
  const el = chartEl.value
  if (!el) return
  const maxH = Math.max(MIN_BAR_H + 1, el.clientHeight - 12)
  barWidthPx.value = computeBarWidth(n, el.clientWidth - 16)

  // 线性映射到容器高度，并保证高度互不相同
  const next: Bar[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    next.push({
      id: i,
      height: Math.max(MIN_BAR_H, Math.round(MIN_BAR_H + (maxH - MIN_BAR_H) * t)),
    })
  }
  // 极矮容器 round 撞车时抬高重复项
  const used = new Set<number>()
  for (const bar of next) {
    let h = bar.height
    while (used.has(h) && h < maxH) h += 1
    used.add(h)
    bar.height = h
  }
  shuffleInPlace(next)
  // 槽位 id 固定为下标，之后只改 height，方便高度过渡动画
  bars.value = next.map((b, index) => ({ id: index, height: b.height }))
  hasBars.value = true
  resetStats()

  await nextTick()
  const heights = bars.value.map((b) => b.height)
  const totalWidth =
    bars.value.length * barWidthPx.value + BAR_GAP * Math.max(0, bars.value.length - 1)
  const domCount = el.querySelectorAll('.bar').length
  console.log('[generateBars] 排查', {
    输入数量: n,
    数组根数: bars.value.length,
    DOM根数: domCount,
    不重复高度数: new Set(heights).size,
    柱宽px: barWidthPx.value,
    容器宽: el.clientWidth,
    容器高: el.clientHeight,
    总内容宽: totalWidth,
    是否应出现横向滚动: totalWidth > el.clientWidth - 16,
    高度数组: heights,
  })
}

/** 不改数量与高度集合，只再打乱当前柱子顺序 */
async function shuffleBars() {
  if (!hasBars.value) return
  if (running.value) await stopCurrentPlay()
  const heights = bars.value.map((b) => b.height)
  shuffleInPlace(heights)
  bars.value = bars.value.map((b, i) => ({ id: b.id, height: heights[i] }))
  resetStats()
}

/** 等待指定毫秒（动画步进间隔） */
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** 把一步 swap/write 应用到 bars，并更新高亮下标 */
function applyStepToBars(step: Step) {
  const list = bars.value
  if (step.type === 'swap') {
    const h = list[step.i].height
    list[step.i] = { ...list[step.i], height: list[step.j].height }
    list[step.j] = { ...list[step.j], height: h }
    activeIndexes.value = [step.i, step.j]
  } else {
    list[step.i] = { ...list[step.i], height: step.value }
    activeIndexes.value = [step.i]
  }
}

/**
 * 预生成所选算法的全部步骤，再按 speedMs 逐步播放。
 * 进行中改速度马上生效；abort 或 playToken 变化则中断本轮。
 */
async function runSort(name: SortName) {
  if (!hasBars.value || running.value) return

  abort = false
  const token = ++playToken
  running.value = true
  status.value = '进行中'
  moves.value = 0
  elapsedText.value = '—'

  const heights = bars.value.map((b) => b.height)
  const steps = sortFns[name](heights)
  const t0 = performance.now()

  for (const step of steps) {
    if (abort || token !== playToken) break
    applyStepToBars(step)
    moves.value += 1
    await delay(speedMs.value)
  }

  const elapsed = (performance.now() - t0) / 1000
  elapsedText.value = `${elapsed.toFixed(2)} s`
  activeIndexes.value = []
  running.value = false

  if (abort || token !== playToken) {
    status.value = '已停止'
  } else {
    status.value = '已完成'
  }
}

/** 用户点击「停止」：仅置 abort，由播放循环收尾并写「已停止」 */
function stopSort() {
  if (!running.value) return
  abort = true
}
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  box-sizing: border-box;
  overflow: hidden;
}

.page h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.row + .row {
  margin-top: 8px;
}

.complexity-trigger {
  margin-left: 4px;
}

.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(15, 23, 42, 0.35);
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 50;
  width: min(520px, 92vw);
  height: 100%;
  background: var(--panel);
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 24px rgba(15, 23, 42, 0.08);
  transform: translateX(100%);
  transition: transform 0.22s ease;
  display: flex;
  flex-direction: column;
}

.drawer-open {
  transform: translateX(0);
}

.drawer-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.drawer-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.drawer-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 12px 16px 20px;
}

.complexity-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--text);
}

.complexity-table th,
.complexity-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.complexity-table th {
  color: var(--muted);
  font-weight: 500;
}

.drawer-note {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

input[type='number'] {
  width: 88px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 14px;
}

input[type='number']:focus {
  outline: 2px solid var(--input-focus);
  outline-offset: 0;
}

.speed-label {
  margin-left: 4px;
  font-size: 14px;
  color: var(--muted);
}

.speed-select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: var(--text);
}

.speed-select:focus {
  outline: 2px solid var(--input-focus);
  outline-offset: 0;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--btn-secondary-border);
  background: var(--btn-secondary-bg);
  color: var(--text);
}

.btn-primary {
  background: var(--btn-primary-bg);
  border-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}

.btn-danger {
  border-color: var(--btn-danger-border);
  color: var(--btn-danger-text);
  background: #ffffff;
}

.btn:disabled {
  background: var(--btn-disabled-bg);
  color: var(--btn-disabled-text);
  border-color: var(--btn-disabled-border);
  cursor: not-allowed;
}

.error {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--error);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.stat-label {
  font-size: 14px;
  color: var(--muted);
}

.stat-value {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.chart {
  flex: 1 1 auto;
  min-height: 200px;
  padding: 12px 8px 0;
  display: flex;
  align-items: flex-end;
  gap: var(--bar-gap, 1px);
  overflow-x: auto;
  overflow-y: hidden;
}

.chart-empty {
  flex: 1 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 14px;
}

.bar {
  flex: 0 0 var(--bar-width, 6px);
  width: var(--bar-width, 6px);
  min-width: var(--bar-width, 6px);
  background: var(--bar);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  transition:
    height var(--bar-transition, 100ms) linear,
    background-color var(--bar-transition, 100ms) linear;
}

.bar.active {
  background: var(--bar-active);
}
</style>
