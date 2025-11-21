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
import { ModuleRegistry, AllCommunityModule, themeQuartz, colorSchemeLight, iconSetQuartz } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule, RowNumbersModule } from 'ag-grid-enterprise';
import type { ColDef, GridReadyEvent, GridApi, Theme } from 'ag-grid-community';
import type { TreeTableProps, TreeRowData } from '../types/tree.type';
import { useTreeTableData } from '../composables/useTreeTableData';
import { useTreeTableColumns } from '../composables/useTreeTableColumns';

// Регистрация модулей AG Grid
ModuleRegistry.registerModules([
  AllCommunityModule,
  RowGroupingModule,
  TreeDataModule,
  RowNumbersModule
]);

const props = defineProps<TreeTableProps>();
const { rowData, getDataPath } = useTreeTableData(props);
const { columnDefs, autoGroupColumnDef } = useTreeTableColumns(props);

// Настройка темы AG Grid
const myTheme = themeQuartz
  .withPart(iconSetQuartz)
  .withPart(colorSchemeLight)
  .withParams({
    headerColumnBorder: 'none',
    columnBorder: 'none',
  });

// Ссылка на API таблицы
const gridApi = ref<GridApi | null>(null);

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
    if (params.api) {
      params.api.expandAll();
      params.api.refreshCells();
    }
  }, 300);
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
  columnDefs: columnDefs.value,
  rowData: rowData.value,
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: -1, 
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
