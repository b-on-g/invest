// Чистая доменная логика ребаланса ВДО. Без $mol, без сети — всё в памяти.
// Парсинг xlsx через SheetJS (работает и в браузере, и в node).
import * as XLSX from 'xlsx'

export type BondShare = { bond: string; share: number } // share в % внутри квартиля
export type Basket = BondShare[]
export type Quartiles = Record<string, Basket> // 'Q1'..'Q4' -> корзина
export type Holdings = Record<string, number> // нормализованное имя -> текущая стоимость позиции, ₽
export type Action = 'buy' | 'sell' | 'hold'
export type Order = { bond: string; action: Action; rub: number; targetRub: number; currentRub: number }

// Ключ для сопоставления имён с разных сторон (xlsx <-> портфель).
// Пока грубо: аптрим, схлопнуть пробелы, унифицировать латиницу/кириллицу P/Р.
export function normName(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[PР]/g, 'P') // латинская P и кириллическая Р -> одна
    .trim()
}

// Читает все листы Qx с колонками "облигация" / "доля в Q".
export function loadQuartiles(data: ArrayBuffer | Uint8Array): Quartiles {
  const wb = XLSX.read(data, { type: 'array' })
  const out: Quartiles = {}
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName])
    const basket: Basket = []
    for (const r of rows) {
      const bond = String(r['облигация'] ?? '').trim()
      const share = Number(r['доля в Q'])
      if (bond && Number.isFinite(share)) basket.push({ bond, share })
    }
    if (basket.length) out[sheetName] = basket
  }
  return out
}

// Доли в файле суммируются ~в 100, но не ровно. Приводим к сумме 100.
export function normalizeWeights(basket: Basket): Basket {
  const sum = basket.reduce((s, b) => s + b.share, 0)
  if (sum <= 0) return basket.map(b => ({ ...b, share: 0 }))
  return basket.map(b => ({ bond: b.bond, share: (b.share / sum) * 100 }))
}

// Оставить только разрешённые (ликвидные) имена и пере-нормировать веса на них.
export function restrictTo(basket: Basket, allowed: Set<string>): Basket {
  const kept = basket.filter(b => allowed.has(normName(b.bond)))
  return normalizeWeights(kept)
}

// Целевая аллокация в ₽ по капиталу.
export function targetRub(basket: Basket, capital: number): Holdings {
  const norm = normalizeWeights(basket)
  const out: Holdings = {}
  for (const b of norm) out[normName(b.bond)] = (b.share / 100) * capital
  // сохраняем «человеческое» имя отдельной картой при желании — здесь ключ нормализованный
  return out
}

// Diff между текущим портфелем и целью -> список ордеров в ₽.
// minOrderRub — не дёргаемся из-за копеечных расхождений.
export function rebalance(
  current: Holdings,
  target: Holdings,
  opts: { minOrderRub?: number } = {}
): Order[] {
  const min = opts.minOrderRub ?? 0
  const keys = new Set([...Object.keys(current), ...Object.keys(target)])
  const orders: Order[] = []
  for (const k of keys) {
    const cur = current[k] ?? 0
    const tgt = target[k] ?? 0
    const delta = tgt - cur
    let action: Action = 'hold'
    if (Math.abs(delta) > min) action = delta > 0 ? 'buy' : 'sell'
    orders.push({ bond: k, action, rub: Math.abs(delta), targetRub: tgt, currentRub: cur })
  }
  // сначала продажи (освобождаем кэш), потом покупки; внутри — по размеру
  const rank = (a: Action) => (a === 'sell' ? 0 : a === 'buy' ? 1 : 2)
  return orders.sort((a, b) => rank(a.action) - rank(b.action) || b.rub - a.rub)
}
