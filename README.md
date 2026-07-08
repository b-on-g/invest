# ВДО Ребаланс

Local-first апп на $mol: закидываешь xlsx с квартилями ВДО → апп сравнивает с текущим портфелем и говорит, что купить/продать для ребаланса. Всё в браузере, без сервера. Ордера ставишь руками в Т-Банке.

Подробности: [files/prd.md](files/prd.md)

## Модули

- `core/` — чистая доменная логика (парсинг xlsx, нормировка весов, diff ордеров) + тесты
- `calc/` — экран ребаланса: импорт xlsx, квартиль, капитал, портфель, список сделок
- `lk/` — личный кабинет: имя, аватар, статистика и история ребалансов (Giper Baza)
- `store/` — схема данных Giper Baza
- `app/` — корневая страница с навигацией

## Dev

```bash
cd /path/to/mam && npm start
# Open http://localhost:9080/bog/invest/app/-/test.html
```

## Build

```bash
npx mam bog/invest
```

## Deploy

Push to `main` → GitHub Actions → GitHub Pages: https://b-on-g.github.io/invest/

Feature branches deploy to: https://b-on-g.github.io/invest/{branch-name}/
