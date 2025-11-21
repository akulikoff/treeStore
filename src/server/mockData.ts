import type { TreeItem } from '../types/tree.type';

/**
 * Примеры тестовых данных для тестирования TreeStore
 */
export const sampleTreeData: TreeItem[] = [
  { id: 1, parent: null, name: "Проекты", type: "folder", description: "Корневая папка проектов" },
  { id: 2, parent: 1, name: "Web приложения", type: "folder", description: "Веб-проекты" },
  { id: 3, parent: 1, name: "Мобильные приложения", type: "folder", description: "Мобильные проекты" },
  { id: 4, parent: 2, name: "E-commerce сайт", type: "project", description: "Интернет-магазин" },
  { id: 5, parent: 2, name: "Корпоративный портал", type: "project", description: "Внутренний портал компании" },
  { id: 6, parent: 4, name: "Frontend", type: "module", description: "Клиентская часть" },
  { id: 7, parent: 4, name: "Backend", type: "module", description: "Серверная часть" },
  { id: 8, parent: 4, name: "База данных", type: "module", description: "Структура БД" },
  { id: 9, parent: 6, name: "Компоненты UI", type: "file", description: "React компоненты" },
  { id: 10, parent: 6, name: "Стили", type: "file", description: "CSS файлы" },
  { id: 11, parent: 7, name: "API Routes", type: "file", description: "Маршруты API" },
  { id: 12, parent: 7, name: "Middleware", type: "file", description: "Промежуточное ПО" },
  { id: 13, parent: 3, name: "iOS приложение", type: "project", description: "Нативное iOS приложение" },
  { id: 14, parent: 3, name: "Android приложение", type: "project", description: "Нативное Android приложение" },
  { id: 15, parent: null, name: "Документация", type: "folder", description: "Техническая документация" },
  { id: 16, parent: 15, name: "API документация", type: "document", description: "Описание API" },
  { id: 17, parent: 15, name: "Руководство пользователя", type: "document", description: "Инструкция для пользователей" },
];

/**
 * Генерирует тестовые данные с указанным количеством элементов
 */
export function generateTestData(count: number): TreeItem[] {
  const items: TreeItem[] = [];
  
  // Создаем корневые элементы (10% от общего количества)
  const rootCount = Math.max(1, Math.floor(count * 0.1));
  for (let i = 0; i < rootCount; i++) {
    items.push({
      id: i,
      parent: null,
      name: `Root ${i}`,
      type: "folder"
    });
  }
  
  // Создаем дочерние элементы
  for (let i = rootCount; i < count; i++) {
    const parentId = Math.floor(Math.random() * i);
    items.push({
      id: i,
      parent: parentId,
      name: `Item ${i}`,
      type: Math.random() > 0.7 ? "folder" : "file"
    });
  }
  
  return items;
}