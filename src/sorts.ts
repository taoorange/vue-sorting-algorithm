export type Step =
  | { type: 'swap'; i: number; j: number }
  | { type: 'write'; i: number; value: number }

/** 按步骤回放，用于校验算法是否排成升序 */
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

export function selectionSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  for (let i = 0; i < a.length; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j
    }
    if (min !== i) {
      const t = a[i]
      a[i] = a[min]
      a[min] = t
      steps.push({ type: 'swap', i, j: min })
    }
  }
  return steps
}

export function insertionSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []
  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]
      steps.push({ type: 'write', i: j + 1, value: a[j] })
      j--
    }
    a[j + 1] = key
    steps.push({ type: 'write', i: j + 1, value: key })
  }
  return steps
}

export function quickSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []

  function swap(i: number, j: number) {
    if (i === j) return
    const t = a[i]
    a[i] = a[j]
    a[j] = t
    steps.push({ type: 'swap', i, j })
  }

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

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  if (a.length > 0) sort(0, a.length - 1)
  return steps
}

export function mergeSortSteps(arr: number[]): Step[] {
  const a = [...arr]
  const steps: Step[] = []

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
