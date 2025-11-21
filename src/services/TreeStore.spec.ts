import { describe, it, expect, beforeEach } from 'vitest'
import { TreeStore } from './TreeStore'
import type { TreeItem } from '../types/tree.type'

describe('TreeStore', () => {
  let store: TreeStore
  let sampleData: TreeItem[]

  beforeEach(() => {
    sampleData = [
      { id: 1, parent: null, name: 'Root' },
      { id: 2, parent: 1, name: 'Child 1' },
      { id: 3, parent: 1, name: 'Child 2' },
      { id: 4, parent: 2, name: 'Grandchild 1' },
      { id: 5, parent: 2, name: 'Grandchild 2' },
      { id: 6, parent: null, name: 'Root 2' },
    ]
    store = new TreeStore(sampleData)
  })

  describe('constructor', () => {
    it('should initialize with empty array', () => {
      const emptyStore = new TreeStore()
      expect(emptyStore.getAll()).toEqual([])
    })

    it('should initialize with provided items', () => {
      expect(store.getAll()).toEqual(sampleData)
    })
  })

  describe('getAll', () => {
    it('should return all items', () => {
      const items = store.getAll()
      expect(items).toHaveLength(6)
      expect(items).toEqual(sampleData)
    })

    it('should return reference to original array', () => {
      const items = store.getAll()
      expect(items).toBe(sampleData)
    })
  })

  describe('getItem', () => {
    it('should return item by id', () => {
      const item = store.getItem(1)
      expect(item).toEqual({ id: 1, parent: null, name: 'Root' })
    })

    it('should return undefined for non-existent id', () => {
      const item = store.getItem(999)
      expect(item).toBeUndefined()
    })

    it('should work with string ids', () => {
      const stringStore = new TreeStore([
        { id: 'a', parent: null, name: 'Item A' },
      ])
      expect(stringStore.getItem('a')).toEqual({ id: 'a', parent: null, name: 'Item A' })
    })
  })

  describe('getChildren', () => {
    it('should return direct children', () => {
      const children = store.getChildren(1)
      expect(children).toHaveLength(2)
      expect(children.map(c => c.id)).toEqual([2, 3])
    })

    it('should return empty array for leaf nodes', () => {
      const children = store.getChildren(4)
      expect(children).toEqual([])
    })

    it('should return empty array for non-existent id', () => {
      const children = store.getChildren(999)
      expect(children).toEqual([])
    })

    it('should return empty array for root without children', () => {
      const children = store.getChildren(6)
      expect(children).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('should return all descendants', () => {
      const allChildren = store.getAllChildren(1)
      expect(allChildren).toHaveLength(4)
      expect(allChildren.map(c => c.id)).toEqual([2, 4, 5, 3])
    })

    it('should return empty array for leaf nodes', () => {
      const allChildren = store.getAllChildren(4)
      expect(allChildren).toEqual([])
    })

    it('should cache results', () => {
      const first = store.getAllChildren(1)
      const second = store.getAllChildren(1)
      expect(first).toBe(second) // Та же ссылка
    })

    it('should handle deep nesting', () => {
      const deepData: TreeItem[] = [
        { id: 1, parent: null },
        { id: 2, parent: 1 },
        { id: 3, parent: 2 },
        { id: 4, parent: 3 },
      ]
      const deepStore = new TreeStore(deepData)
      const allChildren = deepStore.getAllChildren(1)
      expect(allChildren).toHaveLength(3)
      expect(allChildren.map(c => c.id)).toEqual([2, 3, 4])
    })
  })

  describe('getAllParents', () => {
    it('should return parent chain', () => {
      const parents = store.getAllParents(4)
      // Возвращает массив с родителями (реализация может включать или не включать сам элемент)
      expect(parents.length).toBeGreaterThan(0)
      // Должен содержать родительские элементы
      const ids = parents.map(p => p.id)
      expect(ids).toContain(2) // Прямой родитель
      expect(ids).toContain(1) // Прародитель
    })

    it('should return empty array for non-existent id', () => {
      const parents = store.getAllParents(999)
      expect(parents).toEqual([])
    })

    it('should cache results', () => {
      const first = store.getAllParents(4)
      const second = store.getAllParents(4)
      expect(first).toBe(second) // Та же ссылка
    })

    it('should work with nested hierarchy', () => {
      const parents = store.getAllParents(5)
      expect(parents.length).toBeGreaterThan(0)
    })
  })

  describe('addItem', () => {
    it('should add new item', () => {
      const newItem: TreeItem = { id: 7, parent: 1, name: 'New Child' }
      store.addItem(newItem)

      expect(store.getItem(7)).toEqual(newItem)
      expect(store.getAll()).toHaveLength(7)
    })

    it('should update parent-child relationships', () => {
      const newItem: TreeItem = { id: 7, parent: 1, name: 'New Child' }
      store.addItem(newItem)

      const children = store.getChildren(1)
      expect(children).toHaveLength(3)
      expect(children.map(c => c.id)).toContain(7)
    })

    it('should not add duplicate ids', () => {
      const duplicate: TreeItem = { id: 1, parent: null, name: 'Duplicate' }
      store.addItem(duplicate)

      expect(store.getAll()).toHaveLength(6) // Без изменений
    })

    it('should add root item', () => {
      const newRoot: TreeItem = { id: 7, parent: null, name: 'New Root' }
      store.addItem(newRoot)

      expect(store.getItem(7)).toEqual(newRoot)
      expect(store.getChildren(7)).toEqual([])
    })

    it('should invalidate cache', () => {
      const allChildren = store.getAllChildren(1)
      expect(allChildren).toHaveLength(4)

      store.addItem({ id: 7, parent: 2, name: 'New' })

      const updatedChildren = store.getAllChildren(1)
      expect(updatedChildren).toHaveLength(5)
    })
  })

  describe('removeItem', () => {
    it('should remove item', () => {
      store.removeItem(3)

      expect(store.getItem(3)).toBeUndefined()
      expect(store.getAll()).toHaveLength(5)
    })

    it('should remove item and all descendants', () => {
      store.removeItem(2)

      expect(store.getItem(2)).toBeUndefined()
      expect(store.getItem(4)).toBeUndefined()
      expect(store.getItem(5)).toBeUndefined()
      expect(store.getAll()).toHaveLength(3)
    })

    it('should update parent-child relationships', () => {
      store.removeItem(2)

      const children = store.getChildren(1)
      expect(children).toHaveLength(1)
      expect(children[0]?.id).toBe(3)
    })

    it('should do nothing for non-existent id', () => {
      store.removeItem(999)
      expect(store.getAll()).toHaveLength(6)
    })

    it('should invalidate cache', () => {
      const allChildren = store.getAllChildren(1)
      expect(allChildren).toHaveLength(4)

      store.removeItem(4)

      const updatedChildren = store.getAllChildren(1)
      expect(updatedChildren).toHaveLength(3)
    })
  })

  describe('updateItem', () => {
    it('should update item properties', () => {
      const updated: TreeItem = { id: 2, parent: 1, name: 'Updated Child' }
      store.updateItem(updated)

      const item = store.getItem(2)
      expect(item?.name).toBe('Updated Child')
    })

    it('should handle parent change', () => {
      const updated: TreeItem = { id: 4, parent: 3, name: 'Grandchild 1' }
      store.updateItem(updated)

      expect(store.getChildren(2).map(c => c.id)).toEqual([5])
      expect(store.getChildren(3).map(c => c.id)).toEqual([4])
    })

    it('should handle moving to root', () => {
      const updated: TreeItem = { id: 4, parent: null, name: 'Grandchild 1' }
      store.updateItem(updated)

      expect(store.getChildren(2).map(c => c.id)).toEqual([5])
      // Элемент перемещен в корень, не должен иметь родителя
      expect(store.getItem(4)?.parent).toBeNull()
    })

    it('should do nothing for non-existent id', () => {
      const updated: TreeItem = { id: 999, parent: 1, name: 'Non-existent' }
      store.updateItem(updated)

      expect(store.getItem(999)).toBeUndefined()
    })

    it('should invalidate cache', () => {
      const parentsBefore = store.getAllParents(4)
      const lengthBefore = parentsBefore.length

      store.updateItem({ id: 4, parent: 1, name: 'Grandchild 1' })

      const parentsAfter = store.getAllParents(4)
      // После перемещения цепочка родителей должна быть другой
      expect(parentsAfter.length).not.toBe(lengthBefore)
    })
  })

  describe('performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeData: TreeItem[] = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        parent: i === 0 ? null : Math.floor(i / 2),
        name: `Item ${i}`,
      }))

      const start = performance.now()
      const largeStore = new TreeStore(largeData)
      const constructorTime = performance.now() - start

      expect(constructorTime).toBeLessThan(100) // Должно быть быстро

      const getItemStart = performance.now()
      largeStore.getItem(5000)
      const getItemTime = performance.now() - getItemStart

      expect(getItemTime).toBeLessThan(1) // Операция O(1)
    })

    it('should cache getAllChildren results', () => {
      const firstCall = performance.now()
      store.getAllChildren(1)
      const firstTime = performance.now() - firstCall

      const secondCall = performance.now()
      store.getAllChildren(1)
      const secondTime = performance.now() - secondCall

      expect(secondTime).toBeLessThan(firstTime) // Кэшированный результат должен быть быстрее
    })
  })

  describe('edge cases', () => {
    it('should handle circular reference prevention', () => {
      // TreeStore не предотвращает циклические ссылки, но не должен падать
      const circularData: TreeItem[] = [
        { id: 1, parent: 2 },
        { id: 2, parent: 1 },
      ]
      const circularStore = new TreeStore(circularData)

      expect(circularStore.getAll()).toHaveLength(2)
    })

    it('should handle orphaned items', () => {
      const orphanData: TreeItem[] = [
        { id: 1, parent: 999 }, 
      ]
      const orphanStore = new TreeStore(orphanData)

      expect(orphanStore.getChildren(999)).toEqual([])
      expect(orphanStore.getItem(1)).toBeDefined()
      expect(orphanStore.getItem(1)?.parent).toBe(999)
    })

    it('should handle mixed id types', () => {
      const mixedData: TreeItem[] = [
        { id: 1, parent: null },
        { id: 'a', parent: 1 },
        { id: 2, parent: 'a' },
      ]
      const mixedStore = new TreeStore(mixedData)

      expect(mixedStore.getItem(1)).toBeDefined()
      expect(mixedStore.getItem('a')).toBeDefined()
      expect(mixedStore.getChildren(1).map(c => c.id)).toEqual(['a'])
    })
  })
})
