/**
 * Базовый интерфейс TreeItem, представляющий узел в древовидной структуре
 */
export interface TreeItem {
  /** Уникальный идентификатор элемента дерева */
  id: string | number;
  /** Ссылка на id родительского элемента, null/undefined для корневых элементов */
  parent?: string | number | null;
  /** Дополнительные произвольные поля */
  [key: string]: unknown;
}

/**
 * Интерфейс для класса TreeStore, управляющего иерархическими данными
 */
export interface TreeStoreInterface {
  /** Возвращает исходный массив всех элементов */
  getAll(): TreeItem[];
  /** Возвращает конкретный элемент по id или undefined, если не найден */
  getItem(id: string | number): TreeItem | undefined;
  /** Возвращает прямых потомков указанного элемента */
  getChildren(id: string | number): TreeItem[];
  /** Возвращает всех потомков указанного элемента на всех уровнях */
  getAllChildren(id: string | number): TreeItem[];
  /** Возвращает цепочку родительских элементов от указанного элемента до корня */
  getAllParents(id: string | number): TreeItem[];
  /** Добавляет новый элемент в древовидную структуру */
  addItem(item: TreeItem): void;
  /** Удаляет элемент и всех его потомков из дерева */
  removeItem(id: string | number): void;
  /** Обновляет существующий элемент в дереве */
  updateItem(item: TreeItem): void;
}

/**
 * Интерфейс пропсов для Vue-компонента TreeTable
 */
export interface TreeTableProps {
  /** Экземпляр TreeStore, содержащий иерархические данные */
  treeStore: TreeStoreInterface;
  /** Опциональные определения колонок для таблицы */
  columns?: ColumnConfig[];
}

/**
 * Расширенный интерфейс TreeItem для данных строк таблицы с дополнительными свойствами отображения
 */
export interface TreeRowData extends TreeItem {
  /** Порядковый номер строки в таблице (вычисляется динамически) */
  rowNumber?: number;
  /** Категория элемента: "Группа" для элементов с детьми, "Элемент" для листовых узлов */
  category: "Группа" | "Элемент";
  /** Уровень вложенности в иерархии */
  level: number;
  /** Имеет ли этот элемент детей */
  hasChildren: boolean;
  /** Текущее состояние раскрытия (опционально) */
  expanded?: boolean;
}

/**
 * Интерфейс конфигурации колонки для AG Grid
 */
export interface ColumnConfig {
  /** Имя поля для отображения */
  field: string;
  /** Текст заголовка колонки */
  headerName: string;
  /** Опциональная ширина колонки */
  width?: number;
  /** Опциональный пользовательский рендерер ячейки */
  cellRenderer?: string;
  /** Можно ли сортировать колонку */
  sortable?: boolean;
  /** Включена ли фильтрация для колонки */
  filter?: boolean;
}