# Настройка окружения

## 0. Версии (H0)

Стартовый шаблон академии собран на React 18.2, React Router 6.16, Redux Toolkit 1.9, Vite 4, Vitest 0.34, `eslint-plugin-react-hooks` 4.6. Первый PR (H0) - перевести его на актуальные версии (ноябрь 2026):

| Пакет | Было | Стало |
|-------|------|-------|
| Node.js | любая | **24+** (требует `eslint-config-htmlacademy` 11; React Router 8 требует 22.22+) |
| `react`, `react-dom` | 18.2 | 19.3 |
| `@types/react`, `@types/react-dom` | 18 | 19 |
| `react-router-dom` | 6.16 | удалить, вместо него `react-router` 8 |
| `@reduxjs/toolkit` | 1.9 | 2.x |
| `react-redux` | 8 | 9 |
| `vite` | 4 | 8 |
| `@vitejs/plugin-react` | 4 | 6 |
| `vitest` | 0.34 | 5 |
| `typescript` | 5.2 | **7.0** для проверки типов + пакет совместимости TypeScript 6 для линтера, см. раздел 0.1 |
| `eslint` | 8 | 10, конфиг переводится на flat config (`eslint.config.js`) |
| `eslint-config-htmlacademy` | 9.1 | 11, пресет `eslint-config-htmlacademy/react-typescript` |
| `@testing-library/react` | 14 | 16 |
| `eslint-plugin-react-hooks` | 4.6 | 7 (flat config) |

Берите последние версии из этих линеек на момент работы - `npm outdated` покажет, что ещё отстаёт.

### 0.1. TypeScript 7

TypeScript 7 - компилятор, переписанный на Go, проверка типов в разы быстрее. Но `typescript-eslint` (на нём построен линтер академии) пока работает только с API TypeScript до 6.0 и с TypeScript 7 падает с ошибкой `typescript-eslint does not support TS 7.0`.

Решение - поставить оба, под разными именами:

```json
"devDependencies": {
  "typescript": "npm:@typescript/typescript6@^6.0.2",
  "typescript7": "npm:typescript@^7.0.2"
},
"scripts": {
  "typecheck": "node node_modules/typescript7/bin/tsc -p .",
  "build": "npm run typecheck && vite build"
}
```

- `typescript` - официальный пакет совместимости от команды TypeScript с API версии 6. Его подхватывают ESLint, `typescript-eslint` и редактор.
- `typescript7` - сам TypeScript 7, только для проверки типов (`npm run typecheck`).
- Команда `npx tsc` в таком проекте запустит версию 6, поэтому проверку типов запускайте только через `npm run typecheck`.

Когда `typescript-eslint` выпустит поддержку TypeScript 7, оба пакета заменяются одним `typescript@7`.

Руководства по переходу (читать до начала, а не после ошибки):

- React 19: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- React Router v6 → v7: https://reactrouter.com/7.18.0/upgrading/v6
- React Router v7 → v8: https://reactrouter.com/upgrading/v7
- Redux Toolkit 2: https://redux-toolkit.js.org/usage/migrating-rtk-2
- Vite: https://vite.dev/guide/migration

## 1. Сервер

Тот же, что в основном проекте:

- API: `https://14.design.htmlacademy.pro/six-cities`
- Спецификация: `https://14.design.htmlacademy.pro/spec/six-cities`

## 2. Яндекс Карты (H5)

Карта в проекте - только Яндекс Карты, JS API 3.0.

1. Войдите в Яндекс ID и откройте кабинет разработчика: https://developer.tech.yandex.ru/services
2. «Подключить API» → **JavaScript API и HTTP Геокодер** → бесплатный тариф.
3. В настройках ключа ограничьте **HTTP Referer**: `localhost`, `127.0.0.1`.
4. Ключ активируется до 15 минут, до этого API отвечает `403`.

Ключ - в `.env.local` (не коммитится):

```
VITE_YANDEX_MAPS_KEY=ваш-ключ
```

В репозиторий - `.env.example`:

```
VITE_YANDEX_MAPS_KEY=
VITE_API_JITTER=false
```

- Документация: https://yandex.ru/maps-api/docs/js-api/index.html
- Типы: `npm i -D @yandex/ymaps3-types`
- Координаты в Яндекс Картах - **`[долгота, широта]`**, а сервер отдаёт `latitude` / `longitude`. Перепутаете порядок - маркеры уедут не туда.
- Leaflet и тайлы OpenStreetMap из проекта удалите.

## 3. Тесты

Vitest + React Testing Library + jsdom. Браузеры не скачиваются, интернет тестам не нужен.

- Ответы сервера в тестах подменяйте через `axios-mock-adapter`.
- API Яндекс Карт в тестах H5 - мок, без загрузки скрипта.
- `IntersectionObserver` в jsdom нет - мок в тестах H7.
- Таймеры (H1) - `vi.useFakeTimers()` и `vi.advanceTimersByTime()`.

## 4. Внешние ресурсы

Никаких сторонних CDN (Google Fonts, unpkg и т. п.): шрифты и стили - локально из вёрстки, скрипт подключается только один - API Яндекс Карт.

## 5. Покрытие и роутер в тестах

- Покрытие: `npm i -D @vitest/coverage-v8`, запуск `npx vitest run --coverage --coverage.include=src/hooks`. Порог 90% можно зафиксировать в `vite.config.ts` (`test.coverage.thresholds`), тогда запуск с `--coverage` упадёт, если покрытие просядет.
- Хуки с React Router (H2, H4, H7) тестируются в обёртке `MemoryRouter` с нужным `initialEntries`.
- Хуки с Redux (H2, H8, H9) - в обёртке `Provider` с тестовым стором.

## 6. Линтер (H0)

`eslint-plugin-react-hooks` 7 подключается в flat config (`eslint.config.js`):

```js
import reactHooks from 'eslint-plugin-react-hooks';

import htmlacademy from 'eslint-config-htmlacademy/react-typescript';

export default [
  ...htmlacademy,
  reactHooks.configs.flat.recommended,
];
```

В пресет `recommended` уже входят правила React Compiler (`set-state-in-effect`, `refs`, `set-state-in-render` и другие). Если раньше стоял отдельный `eslint-plugin-react-compiler` - удалите его.

## 7. React Compiler (M7)

В Vite 8 опции `babel` у `@vitejs/plugin-react` больше нет - компилятор подключается отдельным плагином:

```bash
npm i -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler @types/babel__core
```

```ts
// vite.config.ts
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
```

Есть и экспериментальный вариант на Rust - `react({ compiler: true })` с пакетом `oxc-transform-react`. Для курсового берите вариант через Babel: он стабильный.

Чтобы видеть, какие компоненты компилятор пропустил и почему: `react({ compiler: { logDiagnostics: true } })` в Rust-варианте или диагностика ESLint-правил компилятора в Babel-варианте.

## 8. View Transitions (M3)

`<ViewTransition>` опирается на View Transition API браузера. Проверяйте в актуальных Chrome или Яндекс Браузере. В браузере без поддержки обновление просто проходит без анимации - это нормально, ошибок быть не должно.

## 9. Бонус: Next.js (N1)

- Отдельный репозиторий `six-cities-next`, создаётся через `npx create-next-app@latest` (TypeScript, App Router). Next.js - последняя 16.x, Node.js 24+ (Next 16 требует от 20.9, но держите одну версию Node для обоих проектов).
- Запуск: `next build && next start`. Деплой на Vercel не нужен.
- Шрифты - только `next/font/local` с файлами шрифтов из вёрстки. `next/font/google` при сборке скачивает шрифты с серверов Google - не используйте.
- Фото с сервера академии - `next/image` с `images.remotePatterns` для `14.design.htmlacademy.pro`.
- Токен: при входе Server Action получает токен от API академии и кладёт его в httpOnly-cookie; запросы к API с сервера отправляют его в заголовке `X-Token`.
- Документация: https://nextjs.org/docs (раздел App Router).
