# TreeStore

Высокопроизводительное хранилище для работы с иерархическими данными и компонент древовидной таблицы на Vue 3 + AG Grid.

## Возможности

- **TreeStore** - класс для управления древовидными структурами с O(1) операциями через предвычисленные индексы
- **TreeTable** - компонент таблицы с поддержкой иерархии на базе AG Grid Enterprise
- Полная типизация TypeScript
- Покрытие unit-тестами (Vitest)
- CI/CD через GitHub Actions
- Оптимизированная сборка с code-splitting для больших зависимостей

## Быстрый старт

### Установка зависимостей

```sh
npm install
```

### Запуск в режиме разработки

```sh
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173

### Сборка для production

```sh
npm run build
```

### Запуск тестов

```sh
npm run test:unit
```

## Структура проекта

```
src/
├── components/
│   └── TreeTable.vue          # Компонент древовидной таблицы
├── composables/
│   └── useTreeTableData.ts    # Composable для работы с данными таблицы
├── services/
│   └── TreeStore.ts           # Класс для управления иерархическими данными
├── types/
│   └── tree.type.ts           # TypeScript типы
└── server/
    └── mockData.ts            # Тестовые данные
```

## Использование TreeStore

```typescript
import { TreeStore } from './services/TreeStore'

const items = [
  { id: 1, parent: null, name: 'Root' },
  { id: 2, parent: 1, name: 'Child' },
]

const store = new TreeStore(items)

// O(1) операции
store.getItem(1) // Получить элемент
store.getChildren(1) // Получить прямых потомков
store.getAllChildren(1) // Получить всех потомков
store.getAllParents(2) // Получить цепочку родителей
```

## Технологии

- Vue 3 + TypeScript
- AG Grid Enterprise (древовидные таблицы)
- Vite (сборка и dev-сервер)
- Vitest (unit-тестирование)
- ESLint + Prettier (линтинг и форматирование)
- GitHub Actions (CI/CD)

## Производительность

TreeStore использует предвычисленные индексы и кэширование для достижения O(1) сложности операций:

- `getItem()` - O(1) через Map
- `getChildren()` - O(1) через предвычисленный индекс
- `getAllChildren()` - O(1) с кэшированием
- `getAllParents()` - O(1) с кэшированием

## CI/CD

Проект настроен с GitHub Actions для автоматической проверки:

- Линтинг кода
- Проверка типов TypeScript
- Запуск unit-тестов
- Сборка проекта
- Тестирование на Node.js 18 и 20
