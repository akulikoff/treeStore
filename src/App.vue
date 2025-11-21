<template>
  <div class="app">
    <header class="app-header">
      <h1>🌳 TreeTable Component Demo</h1>
      <p>Демонстрация компонента древовидной таблицы с AG Grid</p>
    </header>
    
    <main class="app-main">

      
      <TreeTable 
        ref="treeTableRef"
        :tree-store="treeStore" 
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TreeTable from './components/TreeTable.vue';
import { TreeStore } from './services/TreeStore.ts';
import { sampleTreeData } from './server/mockData';

// Create TreeStore instance for testing
const treeStore = new TreeStore(sampleTreeData);

// Reference to TreeTable component
const treeTableRef = ref<InstanceType<typeof TreeTable> | null>(null);
</script>


<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.app-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.app-main {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover {
  background: #2980b9;
}

.info {
  margin-left: auto;
  color: #7f8c8d;
  font-weight: 500;
}

/* Global styles for better appearance */
:global(body) {
  margin: 0;
  background: #ecf0f1;
}
</style>
