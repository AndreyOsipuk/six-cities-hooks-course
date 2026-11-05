# Настройка окружения

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
- Хуки с Redux (H2, H8, H9) - в обёртке `Provider` с тестовым стором, как в тестах основного проекта.
