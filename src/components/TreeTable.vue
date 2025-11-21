<template>
  <div class="tree-table-container">
    <h3>TreeTable Component ({{ rowData.length }} элементов)</h3>
    <div class="tree-table" data-testid="tree-table">
      <div v-if="rowData.length === 0" class="loading">
        Загрузка данных...
      </div>
      <ag-grid-vue
        v-else
        style="height: 100%; width: 100%;"
        :gridOptions="gridOptions"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { ModuleRegistry, AllCommunityModule, themeQuartz, colorSchemeLight, iconSetQuartz   } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule, RowNumbersModule } from 'ag-grid-enterprise';
import type { ColDef, GridReadyEvent, GridApi, ICellRendererParams,  ValueGetterParams, Theme } from 'ag-grid-community'; // Заменяем RowDataChangedEvent на DataChangedEvent
import type { TreeTableProps, TreeRowData } from '../types/tree.type';


import { useTreeTableData } from '../composables/useTreeTableData';
// Регистрация модулей Ag Grid
ModuleRegistry.registerModules([
  AllCommunityModule,
  RowGroupingModule,
  TreeDataModule,
  RowNumbersModule
]);

const props = defineProps<TreeTableProps>();
const { rowData, getDataPath } = useTreeTableData(props);

const myTheme = themeQuartz
    .withPart(iconSetQuartz)
    .withPart(colorSchemeLight);
// Пропсы компонента

// Ссылка на API таблицы
const gridApi = ref<GridApi | null>(null);


const getColumnDefs = (): ColDef<TreeRowData>[] => {
  const baseColumns: ColDef<TreeRowData>[] = [
    {
      field: 'rowNumber',
      headerName: '№ п/п',
      width: 80,
      sortable: false,
      filter: false,
      pinned: 'left',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' },
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
    }
  ];

  let dataColumns: ColDef<TreeRowData>[] = [];
  if (props.columns && props.columns.length > 0) {
    dataColumns = props.columns.map(col => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width || 200,
      sortable: false,
      filter: false,
      cellRenderer: col.cellRenderer
    })) as ColDef<TreeRowData>[];
  } else {
    dataColumns = [
      {
        field: 'description',
        headerName: 'Наименование',
        width: 250,
        sortable: false,
        filter: false,
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
            return { ...baseStyle, fontWeight: 'normal', color: 'gray' }; // <-- Жирный шрифт
          }

          return baseStyle; // <-- Обычный шрифт
        },
        cellRenderer: (params: ICellRendererParams<TreeRowData>) => {
          return params.data?.description || '';
        }
      }
    ] as ColDef<TreeRowData>[];
  }

  return [...baseColumns, ...dataColumns];
};

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

const refreshRowNumbers = () => {
  if (gridApi.value) {
    gridApi.value.refreshCells({ columns: ['rowNumber'], force: true });
  }
};

function onRowGroupOpened() {
  refreshRowNumbers();
}

function onModelUpdated() {
  refreshRowNumbers();
}



const addEventListeners = (api: GridApi) => {
  api.addEventListener('rowGroupOpened', onRowGroupOpened);
  api.addEventListener('modelUpdated', onModelUpdated);
  api.addEventListener('expandOrCollapseAll', refreshRowNumbers);
};

const removeEventListeners = (api: GridApi) => {
  api.removeEventListener('rowGroupOpened', onRowGroupOpened);
  api.removeEventListener('modelUpdated', onModelUpdated);
  api.removeEventListener('expandOrCollapseAll', refreshRowNumbers);
};

function onGridReady(params: GridReadyEvent<TreeRowData>) {
  gridApi.value = params.api;
  addEventListeners(params.api);
  setTimeout(() => {
    params.api.expandAll();
  }, 100);
}

interface MyGridOptions {
  columnDefs: ColDef<TreeRowData>[];
  rowData: TreeRowData[];
  treeData: boolean;
  animateRows: boolean;
  groupDefaultExpanded: number;
  getDataPath: (data: TreeRowData) => string[];
  autoGroupColumnDef: ColDef<TreeRowData>;
  theme?: Theme;
  suppressHorizontalScroll: boolean;
  alwaysShowHorizontalScroll: boolean;
  suppressColumnVirtualisation: boolean;
  rowHeight?: number;
}

const gridOptions = computed<MyGridOptions>(() => ({
  columnDefs: getColumnDefs(),
  rowData: rowData.value,
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: 1,
  getDataPath: getDataPath,
  autoGroupColumnDef: autoGroupColumnDef.value,
  theme: myTheme,
  rowHeight: 42,
  suppressHorizontalScroll: false,
  alwaysShowHorizontalScroll: false,
  suppressColumnVirtualisation: true,
}));

onUnmounted(() => {
  if (gridApi.value) {
    removeEventListeners(gridApi.value);
  }
});

</script>
<style scoped>
.tree-table-container {
  width: 100%;
  margin: 20px 0;
}

.tree-table-container h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.tree-table {
  width: 100%;
  height: 600px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
  color: #666;
}

</style>