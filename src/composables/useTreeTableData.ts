import { computed } from 'vue';
import type { TreeTableProps, TreeRowData } from '../types/tree.type';

export function useTreeTableData(props: TreeTableProps) {
  const calculateLevel = (itemId: string | number): number => {
    const parents = props.treeStore.getAllParents(itemId);
    return parents.length; // Уровень равен количеству родителей
  };

  const rowData = computed(() => {
    const allItems = props.treeStore.getAll();

    return allItems.map((item) => {
      const children = props.treeStore.getChildren(item.id);
      const level = calculateLevel(item.id);

      return {
        ...item,
        category: children.length > 0 ? "Группа" as const : "Элемент" as const,
        level: level,
        hasChildren: children.length > 0,
        expanded: false
      } as TreeRowData;
    });
  });

  const getDataPath = (data: TreeRowData): string[] => {
    const parents = props.treeStore.getAllParents(data.id);
    // Строим путь от корня до текущего элемента используя уникальные ID
    // getAllParents возвращает только родителей (без самого элемента)
    // Разворачиваем для получения порядка корень-родитель, затем добавляем текущий элемент
    const path = parents.map(parent => parent.id.toString()).reverse();
    path.push(data.id.toString());
    return path;
  };

  return {
    rowData,
    getDataPath,
  };
}