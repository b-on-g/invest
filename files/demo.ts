import { readFileSync } from 'node:fs'
import { loadQuartiles, targetRub, rebalance, normName, Holdings } from './src/rebalance.ts'

const file = process.argv[2]
const capital = Number(process.argv[3] ?? 500_000)
const quartile = process.argv[4] ?? 'Q1'

const buf = readFileSync(file)
const q = loadQuartiles(buf)

console.log('Листы:', Object.keys(q).map(k => `${k}(${q[k].length})`).join(' '))

const basket = q[quartile]
if (!basket) throw new Error(`нет листа ${quartile}`)

// Мок текущего портфеля: якобы уже держим 3 бумаги на разные суммы.
const current: Holdings = {
  [normName('АПРИ 2Р10')]: 40_000,
  [normName('Фордевинд4')]: 8_000,
  [normName('ТГК-14 1Р2')]: 25_000, // этой в Q1 нет -> должна пойти в продажу
}

const target = targetRub(basket, capital)
const orders = rebalance(current, target, { minOrderRub: 500 })

const buys = orders.filter(o => o.action === 'buy')
const sells = orders.filter(o => o.action === 'sell')

const fmt = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'

console.log(`\nКапитал: ${fmt(capital)} | квартиль ${quartile} | бумаг в цели: ${basket.length}`)
console.log(`Ордеров: продать ${sells.length}, купить ${buys.length}\n`)

console.log('— ПРОДАТЬ —')
for (const o of sells) console.log(`  ${o.bond.padEnd(14)} ${fmt(o.rub).padStart(12)}  (${fmt(o.currentRub)} -> ${fmt(o.targetRub)})`)

console.log('\n— КУПИТЬ (топ-8 по размеру) —')
for (const o of buys.slice(0, 8)) console.log(`  ${o.bond.padEnd(14)} ${fmt(o.rub).padStart(12)}  (${fmt(o.currentRub)} -> ${fmt(o.targetRub)})`)

// sanity: сумма целевых = капитал
const tsum = Object.values(target).reduce((s, v) => s + v, 0)
console.log(`\nΣ target = ${fmt(tsum)} (должно ≈ капиталу)`)
