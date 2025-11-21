import type { TreeItem, TreeStoreInterface } from '../types/tree.type';

/**
 * Высокопроизводительный класс TreeStore для управления иерархическими структурами данных
 * Реализует операции O(1) через предвычисленные индексы и стратегии кэширования
 */
export class TreeStore implements TreeStoreInterface {
  // Ссылка на исходный массив для операции getAll() с O(1)
  private items: TreeItem[];
  
  // Предвычисленные индексы для паттернов доступа O(1)
  private itemsMap: Map<string | number, TreeItem>;
  private childrenMap: Map<string | number, TreeItem[]>;
  private parentMap: Map<string | number, TreeItem>;
  
  // Кэширование для дорогостоящих операций
  private allChildrenCache: Map<string | number, TreeItem[]>;
  private parentChainCache: Map<string | number, TreeItem[]>;

  /**
   * Конструктор, который строит внутренние индексы за один проход по массиву
   * @param items Массив объектов TreeItem для инициализации хранилища
   */
  constructor(items: TreeItem[] = []) {
    this.items = items;
    this.itemsMap = new Map();
    this.childrenMap = new Map();
    this.parentMap = new Map();
    this.allChildrenCache = new Map();
    this.parentChainCache = new Map();

    this.buildIndexes();
  }

  /**
   * Строит все внутренние индексы за один проход по массиву элементов
   * Это обеспечивает производительность O(1) для последующих операций
   */
  private buildIndexes(): void {
    // Очищаем существующие индексы
    this.itemsMap.clear();
    this.childrenMap.clear();
    this.parentMap.clear();
    this.allChildrenCache.clear();
    this.parentChainCache.clear();

    // Первый проход для построения itemsMap и инициализации childrenMap
    for (const item of this.items) {
      this.itemsMap.set(item.id, item);
      
      // Инициализируем пустые массивы детей для всех элементов
      if (!this.childrenMap.has(item.id)) {
        this.childrenMap.set(item.id, []);
      }
    }

    // Второй проход для построения связей родитель-потомок
    for (const item of this.items) {
      if (item.parent != null) {
        // Устанавливаем маппинг родителя
        const parent = this.itemsMap.get(item.parent);
        if (parent) {
          this.parentMap.set(item.id, parent);
          
          // Добавляем в список детей родителя
          const siblings = this.childrenMap.get(item.parent);
          if (siblings) {
            siblings.push(item);
          } else {
            this.childrenMap.set(item.parent, [item]);
          }
        }
      }
    }
  }

  /**
   * Возвращает исходный массив всех элементов - операция O(1)
   */
  getAll(): TreeItem[] {
    return this.items;
  }

  /**
   * Возвращает конкретный элемент по id - операция O(1) через поиск в Map
   */
  getItem(id: string | number): TreeItem | undefined {
    return this.itemsMap.get(id);
  }

  /**
   * Возвращает прямых потомков указанного элемента - операция O(1) через предвычисленный индекс
   */
  getChildren(id: string | number): TreeItem[] {
    return this.childrenMap.get(id) || [];
  }

  /**
   * Возвращает всех потомков указанного элемента на всех уровнях - O(1) с кэшированием
   */
  getAllChildren(id: string | number): TreeItem[] {
    // Сначала проверяем кэш
    if (this.allChildrenCache.has(id)) {
      return this.allChildrenCache.get(id)!;
    }

    const result: TreeItem[] = [];
    const directChildren = this.getChildren(id);

    for (const child of directChildren) {
      result.push(child);
      // Рекурсивно получаем всех потомков
      result.push(...this.getAllChildren(child.id));
    }

    // Кэшируем результат для будущего доступа O(1)
    this.allChildrenCache.set(id, result);
    return result;
  }

  /**
   * Возвращает цепочку родительских элементов от указанного элемента до корня - O(1) с кэшированием
   */
  getAllParents(id: string | number): TreeItem[] {
    // Сначала проверяем кэш
    if (this.parentChainCache.has(id)) {
      return this.parentChainCache.get(id)!;
    }

    const result: TreeItem[] = [];
    const item = this.getItem(id);
    
    if (!item) {
      return result;
    }
    
    // Поднимаемся по цепочке родителей
    let currentItem = item;
    while (currentItem.parent != null) {
      const parent = this.parentMap.get(currentItem.id);
      if (parent) {
        result.push(parent);
        currentItem = parent;
      } else {
        break;
      }
    }

    // Кэшируем результат для будущего доступа O(1)
    this.parentChainCache.set(id, result);
    return result;
  }

  /**
   * Добавляет новый элемент в древовидную структуру
   * Эффективно обновляет внутренние индексы
   */
  addItem(item: TreeItem): void {
    // Предотвращаем дублирование ID
    if (this.itemsMap.has(item.id)) {
      console.warn(`Item with id ${item.id} already exists`);
      return;
    }

    // Добавляем в массив элементов и itemsMap
    this.items.push(item);
    this.itemsMap.set(item.id, item);
    
    // Инициализируем массив детей для нового элемента
    this.childrenMap.set(item.id, []);

    // Обновляем связи родитель-потомок
    if (item.parent != null) {
      const parent = this.itemsMap.get(item.parent);
      if (parent) {
        this.parentMap.set(item.id, parent);
        
        // Добавляем в список детей родителя
        const siblings = this.childrenMap.get(item.parent);
        if (siblings) {
          siblings.push(item);
        } else {
          this.childrenMap.set(item.parent, [item]);
        }
      }
    }

    // Инвалидируем затронутые кэши
    this.invalidateCache(new Set([item.id, item.parent].filter(id => id != null) as (string | number)[]));
  }

  /**
   * Удаляет элемент и всех его потомков из дерева
   */
  removeItem(id: string | number): void {
    const item = this.getItem(id);
    if (!item) {
      return;
    }

    // Получаем всех потомков для удаления
    const allDescendants = this.getAllChildren(id);
    const idsToRemove = new Set([id, ...allDescendants.map(d => d.id)]);

    // Удаляем из массива элементов
    this.items = this.items.filter(item => !idsToRemove.has(item.id));

    // Удаляем из всех карт
    for (const idToRemove of idsToRemove) {
      this.itemsMap.delete(idToRemove);
      this.childrenMap.delete(idToRemove);
      this.parentMap.delete(idToRemove);
    }

    // Удаляем из списка детей родителя
    if (item.parent != null) {
      const siblings = this.childrenMap.get(item.parent);
      if (siblings) {
        const index = siblings.findIndex(sibling => sibling.id === id);
        if (index !== -1) {
          siblings.splice(index, 1);
        }
      }
    }

    // Инвалидируем затронутые кэши
    this.invalidateCache(new Set([item.parent, ...Array.from(idsToRemove)].filter(id => id != null) as (string | number)[]));
  }

  /**
   * Обновляет существующий элемент в дереве
   */
  updateItem(item: TreeItem): void {
    const existingItem = this.getItem(item.id);
    if (!existingItem) {
      console.warn(`Item with id ${item.id} not found`);
      return;
    }

    const oldParent = existingItem.parent;
    const newParent = item.parent;

    // Обновляем элемент в массиве элементов
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }

    // Обновляем itemsMap
    this.itemsMap.set(item.id, item);

    // Обрабатываем изменения родительских связей
    if (oldParent !== newParent) {
      // Удаляем из детей старого родителя
      if (oldParent != null) {
        const oldSiblings = this.childrenMap.get(oldParent);
        if (oldSiblings) {
          const index = oldSiblings.findIndex(sibling => sibling.id === item.id);
          if (index !== -1) {
            oldSiblings.splice(index, 1);
          }
        }
        this.parentMap.delete(item.id);
      }

      // Добавляем в детей нового родителя
      if (newParent != null) {
        const parent = this.itemsMap.get(newParent);
        if (parent) {
          this.parentMap.set(item.id, parent);
          
          const newSiblings = this.childrenMap.get(newParent);
          if (newSiblings) {
            newSiblings.push(item);
          } else {
            this.childrenMap.set(newParent, [item]);
          }
        }
      }
    }

    // Инвалидируем затронутые кэши
    this.invalidateCache(new Set([item.id, oldParent, newParent].filter(id => id != null) as (string | number)[]));
  }

  /**
   * Инвалидирует записи кэша для затронутых узлов и их предков
   */
  private invalidateCache(affectedIds: Set<string | number>): void {
    for (const id of affectedIds) {
      this.allChildrenCache.delete(id);
      this.parentChainCache.delete(id);
      
      // Инвалидируем кэши родителей вверх по цепочке
      this.invalidateParentCaches(id);
    }
  }

  /**
   * Рекурсивно инвалидирует кэши для всех родительских узлов
   */
  private invalidateParentCaches(id: string | number): void {
    const parent = this.parentMap.get(id);
    if (parent) {
      this.allChildrenCache.delete(parent.id);
      this.parentChainCache.delete(parent.id);
      this.invalidateParentCaches(parent.id);
    }
  }
}