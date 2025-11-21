import { computed } from 'vue';
import type { TreeTableProps, TreeRowData, TreeItem } from '../types/tree.type';

export function useTreeTableData(props: TreeTableProps) {
  const calculateLevel = (itemId: string | number): number => {
    const parents = props.treeStore.getAllParents(itemId);
    return parents.length - 1; // Вычитаем 1, так как getAllParents включает сам элемент
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
    // Разворачиваем для получения правильной иерархии (корень -> дочерний)
    const path = parents.reverse().map(parent => {
      const name = (parent as TreeItem).name;
      return (name ? String(name) : parent.id.toString());
    });
    return path;
  };

  return {
    rowData,
    getDataPath,
  };
}