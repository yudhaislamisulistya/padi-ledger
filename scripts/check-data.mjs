import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parseCsv } from '../src/csv.js'

const quoted = parseCsv('id,name\r\n1,"Kab. Garut, Jawa Barat"\r\n')
assert.deepEqual(quoted, [{ id: '1', name: 'Kab. Garut, Jawa Barat' }])

const expectations = [
  ['batch_outcomes.csv', 600],
  ['edges_events.csv', 8752],
  ['blockchain_logs.csv', 4768],
]

for (const [file, expected] of expectations) {
  const rows = parseCsv(await readFile(new URL(`../public/data/${file}`, import.meta.url), 'utf8'))
  assert.equal(rows.length, expected, `${file} harus memuat ${expected} baris`)
}

console.log('Data check passed: CSV parser and research record counts are valid.')
