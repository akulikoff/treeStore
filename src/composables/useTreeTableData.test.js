import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useTreeTableData } from './useTreeTableData'

// Мок для TreeStore
const mockTreeStore = {
  getAll: vi.fn(),
  getChildren: vi.fn(),
  getAllParents: vi.fn(),
}

describe('useTreeTableData', () => {
  it('should compute rowData correctly', () => {
    const props = ref({ treeStore: mockTreeStore })
    mockTreeStore.getAll.mockReturnValue([
      { id: 1, name: 'Root', description: 'Root Item' },
      { id: 2, name: 'Child', description: 'Child Item', parentId: 1 },
    ])
    mockTreeStore.getChildren.mockImplementation((id) => {
      if (id === 1) return [{ id: 2, name: 'Child', description: 'Child Item', parentId: 1 }]
      return []
    })
    // getAllParents возвращает только родителей (без самого элемента)
    mockTreeStore.getAllParents.mockImplementation((id) => {
      if (id === 2) return [{ id: 1, name: 'Root', description: 'Root Item' }]
      return []
    })

    const { rowData } = useTreeTableData(props.value)

    expect(rowData.value).toEqual([
      {
        id: 1,
        name: 'Root',
        description: 'Root Item',
        category: 'Группа', // Потому что у id=1 есть дети
        level: 0,
        hasChildren: true,
        expanded: false,
      },
      {
        id: 2,
        name: 'Child',
        description: 'Child Item',
        parentId: 1,
        category: 'Элемент', // Потому что у id=2 нет детей
        level: 1,
        hasChildren: false,
        expanded: false,
      },
    ])
  })

  it('should compute getDataPath correctly', () => {
    const props = ref({ treeStore: mockTreeStore })
    // getAllParents возвращает только родителей (без самого элемента)
    // Возвращает от ближайшего родителя к корню: [родитель, прародитель, ...]
    mockTreeStore.getAllParents.mockReturnValue([
      { id: 2, name: 'SubRoot' },
      { id: 1, name: 'Root' },
    ])

    const { getDataPath } = useTreeTableData(props.value)
    const path = getDataPath({ id: 3 })

    // Путь должен быть: Root -> SubRoot -> Target (используя ID)
    expect(path).toEqual(['1', '2', '3'])
  })

  it('should measure performance of rowData computation', () => {
    const props = ref({ treeStore: mockTreeStore })
    const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
    mockTreeStore.getAll.mockReturnValue(largeDataSet)
    mockTreeStore.getChildren.mockReturnValue([])
    mockTreeStore.getAllParents.mockReturnValue([])

    const start = performance.now()
    const { rowData } = useTreeTableData(props.value)
    const end = performance.now()

    // Простая проверка, что вычисление завершилось и не заняло слишком много времени (например, < 100ms)
    expect(rowData.value.length).toBe(10000)
    expect(end - start).toBeLessThan(100)
  })
})
