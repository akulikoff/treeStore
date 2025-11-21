import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TreeTable from './TreeTable.vue'
import type { TreeStoreInterface } from '../types/tree.type'

// Mock AG Grid components
vi.mock('ag-grid-vue3', () => ({
  AgGridVue: {
    name: 'AgGridVue',
    template: '<div class="ag-grid-mock"></div>',
    props: ['gridOptions'],
  },
}))

vi.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: vi.fn(),
  },
  AllCommunityModule: {},
  themeQuartz: {
    withPart: vi.fn().mockReturnThis(),
    withParams: vi.fn().mockReturnThis(),
  },
  colorSchemeLight: {},
  iconSetQuartz: {},
}))

vi.mock('ag-grid-enterprise', () => ({
  RowGroupingModule: {},
  TreeDataModule: {},
  RowNumbersModule: {},
}))

describe('TreeTable', () => {
  let mockTreeStore: TreeStoreInterface

  beforeEach(() => {
    mockTreeStore = {
      getAll: vi.fn().mockReturnValue([
        { id: 1, name: 'Root', description: 'Root Item', parent: null },
        { id: 2, name: 'Child', description: 'Child Item', parent: 1 },
      ]),
      getChildren: vi.fn().mockImplementation((id) => {
        if (id === 1) return [{ id: 2, name: 'Child', description: 'Child Item', parent: 1 }]
        return []
      }),
      getAllParents: vi.fn().mockImplementation((id) => {
        if (id === 1) return [{ id: 1, name: 'Root', description: 'Root Item', parent: null }]
        if (id === 2) return [
          { id: 2, name: 'Child', description: 'Child Item', parent: 1 },
          { id: 1, name: 'Root', description: 'Root Item', parent: null },
        ]
        return []
      }),
      getItem: vi.fn(),
      getAllChildren: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
    }
  })

  it('renders component with title', () => {
    const wrapper = mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
      },
    })

    expect(wrapper.find('h3').text()).toContain('TreeTable Component')
    expect(wrapper.find('h3').text()).toContain('2 элементов')
  })

  it('shows loading state when no data', () => {
    mockTreeStore.getAll = vi.fn().mockReturnValue([])

    const wrapper = mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
      },
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toBe('Загрузка данных...')
  })

  it('renders AG Grid when data is available', () => {
    const wrapper = mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
      },
    })

    expect(wrapper.find('.ag-grid-mock').exists()).toBe(true)
    expect(wrapper.find('.loading').exists()).toBe(false)
  })

  it('computes rowData correctly with hasChildren flag', () => {
    const wrapper = mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
      },
    })

    const vm = wrapper.vm as any
    const rowData = vm.rowData

    expect(rowData).toHaveLength(2)
    expect(rowData[0]).toMatchObject({
      id: 1,
      name: 'Root',
      category: 'Группа',
      hasChildren: true,
      level: 0,
    })
    expect(rowData[1]).toMatchObject({
      id: 2,
      name: 'Child',
      category: 'Элемент',
      hasChildren: false,
      level: 1,
    })
  })

  it('accepts custom columns configuration', () => {
    const customColumns = [
      { field: 'name', headerName: 'Название', width: 150 },
      { field: 'description', headerName: 'Описание', width: 300 },
    ]

    const wrapper = mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
        columns: customColumns,
      },
    })

    expect(wrapper.props('columns')).toEqual(customColumns)
  })

  it('calls treeStore methods on mount', () => {
    mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
      },
    })

    expect(mockTreeStore.getAll).toHaveBeenCalled()
    expect(mockTreeStore.getChildren).toHaveBeenCalled()
    expect(mockTreeStore.getAllParents).toHaveBeenCalled()
  })

  it('has correct data-testid attribute', () => {
    const wrapper = mount(TreeTable, {
      props: {
        treeStore: mockTreeStore,
      },
    })

    expect(wrapper.find('[data-testid="tree-table"]').exists()).toBe(true)
  })
})
