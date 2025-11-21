import { computed } from 'vue';
import type { ColDef, ValueGetterParams, ICellRendererParams } from 'ag-grid-community';
import type { TreeTableProps, TreeRowData } from '../types/tree.type';

/**
 * Composable для управления конфигурацией колонок AG Grid таблицы
 */
export function useTreeTableColumns(props: TreeTableProps) {
  /**
   * Базовая колонка с порядковым номером строки
   */
  const rowNumberColumn: ColDef<TreeRowData> = {
    field: 'rowNumber',
    headerName: '№ п/п',
    width: 80,
    sortable: false,
    filter: false,
    pinned: 'left',
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      borderRight: 'none'
    },
    valueGetter: (params: ValueGetterParams<TreeRowData>) => {
      if (!params.data || !params.api || !params.node) {
        return '';
      }

      const displayedRowCount = params.api.getDisplayedRowCount();
      for (let i = 0; i < displayedRowCount; i++) {
        const displayedRow = params.api.getDisplayedRowAtIndex(i);
        if (displayedRow?.data && displayedRow.data.id === params.data.id) {
          return i + 1;
        }
      }

      return '';
    }
  };

  /**
   * Колонка описания по умолчанию
   */
  const defaultDescriptionColumn: ColDef<TreeRowData> = {
    field: 'description',
    headerName: 'Наименование',
    minWidth: 350,
    flex: 1,
    sortable: false,
    filter: false,
    resizable: false,
    autoHeight: true,
    cellStyle: (params) => {
      const baseStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontWeight: '500',
      };

      // Условие: строка не имеет потомков
      if (params.data && !params.data.hasChildren) {
        return { ...baseStyle, fontWeight: 'normal', color: 'gray' };
      }

      return baseStyle;
    },
    cellRenderer: (params: ICellRendererParams<TreeRowData>) => {
      return params.data?.description || '';
    }
  };

  /**
   * Вычисляемые колонки данных на основе пропсов
   */
  const dataColumns = computed<ColDef<TreeRowData>[]>(() => {
    if (props.columns && props.columns.length > 0) {
      return props.columns.map((col) => ({
        field: col.field,
        headerName: col.headerName,
        minWidth: col.width || 200,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: col.cellRenderer
      })) as ColDef<TreeRowData>[];
    }

    return [defaultDescriptionColumn];
  });

  /**
   * Полный список колонок для таблицы
   */
  const columnDefs = computed<ColDef<TreeRowData>[]>(() => {
    return [rowNumberColumn, ...dataColumns.value];
  });

  /**
   * Конфигурация колонки автогруппировки для древовидной структуры
   */
  const autoGroupColumnDef = computed<ColDef<TreeRowData>>(() => ({
    headerName: 'Категория',
    field: 'name',
    minWidth: 300,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: (params: ICellRendererParams<TreeRowData>) => {
        return params.data?.name || '';
      }
    },
    cellStyle: (params) => {
      const baseStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      };

      if (params.data && !params.data.hasChildren) {
        return {
          ...baseStyle,
          color: 'gray',
          fontStyle: 'normal',
        };
      }

      return {
        ...baseStyle,
        fontWeight: '500',
      };
    },
    sortable: false,
    filter: false
  }));

  return {
    columnDefs,
    autoGroupColumnDef,
  };
}
