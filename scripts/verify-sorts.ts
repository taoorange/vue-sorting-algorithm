import {
  applySteps,
  bubbleSortSteps,
  selectionSortSteps,
  insertionSortSteps,
  quickSortSteps,
  mergeSortSteps,
} from '../src/sorts'

function assertSorted(name: string, input: number[], steps: ReturnType<typeof bubbleSortSteps>) {
  const result = applySteps(input, steps)
  const expected = [...input].sort((a, b) => a - b)
  const ok = result.length === expected.length && result.every((v, i) => v === expected[i])
  if (!ok) {
    console.error(`FAIL ${name}`, { result, expected, moves: steps.length })
    process.exitCode = 1
    return
  }
  console.log(`PASS ${name} moves=${steps.length}`)
}

const samples = [
  [],
  [1],
  [3, 1, 2],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
  [2, 2, 1, 1, 3],
  Array.from({ length: 40 }, (_, i) => 40 - i),
]

const algos = [
  ['bubble', bubbleSortSteps],
  ['selection', selectionSortSteps],
  ['insertion', insertionSortSteps],
  ['quick', quickSortSteps],
  ['merge', mergeSortSteps],
] as const

for (const sample of samples) {
  for (const [name, fn] of algos) {
    assertSorted(`${name} ${JSON.stringify(sample).slice(0, 40)}`, sample, fn(sample))
  }
}
