<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  bubbleSortSteps,
  selectionSortSteps,
  insertionSortSteps,
  quickSortSteps,
  mergeSortSteps,
  type Step,
} from './sorts'

const STEP_MS = 40
const MIN_BAR_H = 4

type Bar = { id: number; height: number }
type Status = '未开始' | '进行中' | '已完成' | '已停止'

const countInput = ref(100)
const countError = ref('')
const chartEl = ref<HTMLElement | null>(null)

const bars = ref<Bar[]>([])
const activeIndexes = ref<number[]>([])
const hasBars = ref(false)

const status = ref<Status>('未开始')
const moves = ref(0)
const elapsedText = ref('—')
const running = ref(false)

/** 打断当前播放循环 */
let abort = false
/** 防止旧的 async 播放在新一轮开始后仍改状态 */
let playToken = 0

const sortFns = {
  bubble: bubbleSortSteps,
  selection: selectionSortSteps,
  insertion: insertionSortSteps,
  quick: quickSortSteps,
  merge: mergeSortSteps,
} as const

type SortName = keyof typeof sortFns

function resetStats() {
  status.value = '未开始'
  moves.value = 0
  elapsedText.value = '—'
  activeIndexes.value = []
}

function abortRun() {
  abort = true
}

async function stopCurrentPlay() {
  abortRun()
  await new Promise((r) => setTimeout(r, STEP_MS + 10))
  running.value = false
  activeIndexes.value = []
}

function shuffleInPlace<T>(list: T[]) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = list[i]
    list[i] = list[j]
    list[j] = t
  }
}

async function generateBars() {
  const n = Number(countInput.value)
  if (!Number.isInteger(n) || n < 2 || n > 500) {
    countError.value = '请输入 2～500 的整数'
    return
  }
  countError.value = ''

  if (running.value) await stopCurrentPlay()

  await nextTick()
  const el = chartEl.value
  if (!el) return
  const maxH = Math.max(MIN_BAR_H + 1, el.clientHeight - 12)
  const step = (maxH - MIN_BAR_H) / Math.max(1, n - 1)

  const next: Bar[] = []
  for (let i = 0; i < n; i++) {
    next.push({ id: i, height: Math.round(MIN_BAR_H + step * i) })
  }
  shuffleInPlace(next)
  // 槽位 id 固定为下标，之后只改 height，方便高度过渡动画
  bars.value = next.map((b, index) => ({ id: index, height: b.height }))
  hasBars.value = true
  resetStats()
}

async function shuffleBars() {
  if (!hasBars.value) return
  if (running.value) await stopCurrentPlay()
  const heights = bars.value.map((b) => b.height)
  shuffleInPlace(heights)
  bars.value = bars.value.map((b, i) => ({ id: b.id, height: heights[i] }))
  resetStats()
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

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
    await delay(STEP_MS)
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

function stopSort() {
  if (!running.value) return
  abort = true
}
</script>

<template>
  <div class="page">
    <header>
      <h1>排序算法可视化</h1>
      <p class="subtitle">一步一动画 · 统计移动次数与耗时（含动画）</p>
    </header>

    <section class="panel">
      <div class="row">
        <input v-model.number="countInput" type="number" min="2" max="500" />
        <button class="btn btn-primary" type="button" @click="generateBars">生成柱子</button>
        <button class="btn" type="button" :disabled="!hasBars" @click="shuffleBars">重新打乱</button>
        <button class="btn btn-danger" type="button" :disabled="!running" @click="stopSort">停止</button>
      </div>
      <p v-if="countError" class="error">{{ countError }}</p>
      <div class="row">
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('bubble')">冒泡</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('selection')">选择</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('insertion')">插入</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('quick')">快速</button>
        <button class="btn" type="button" :disabled="!hasBars || running" @click="runSort('merge')">归并</button>
      </div>
    </section>

    <section class="panel stats">
      <div>
        <div class="stat-label">状态</div>
        <div class="stat-value">{{ status }}</div>
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

    <section ref="chartEl" class="panel chart">
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
  </div>
</template>
