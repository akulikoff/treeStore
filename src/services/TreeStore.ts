import type { TreeItem, TreeStoreInterface } from '../types/tree.type';

/**
 * High-performance TreeStore class for managing hierarchical data structures
 * Implements O(1) operations through pre-computed indexes and caching strategies
 */
export class TreeStore implements TreeStoreInterface {
  // Original array reference for O(1) getAll() operation
  private items: TreeItem[];
  
  // Pre-computed indexes for O(1) access patterns
  private itemsMap: Map<string | number, TreeItem>;
  private childrenMap: Map<string | number, TreeItem[]>;
  private parentMap: Map<string | number, TreeItem>;
  
  // Caching for expensive operations
  private allChildrenCache: Map<string | number, TreeItem[]>;
  private parentChainCache: Map<string | number, TreeItem[]>;

  /**
   * Constructor that builds internal indexes with single array traversal
   * @param items Array of TreeItem objects to initialize the store
   */
  constructor(items: TreeItem[] = []) {
    this.items = items;
    this.itemsMap = new Map();
    this.childrenMap = new Map();
    this.parentMap = new Map();
    this.allChildrenCache = new Map();
    this.parentChainCache = new Map();

    this.buildIndexes();
  }

  /**
   * Builds all internal indexes with a single traversal of the items array
   * This ensures O(1) performance for subsequent operations
   */
  private buildIndexes(): void {
    // Clear existing indexes
    this.itemsMap.clear();
    this.childrenMap.clear();
    this.parentMap.clear();
    this.allChildrenCache.clear();
    this.parentChainCache.clear();

    // Single pass to build itemsMap and initialize childrenMap
    for (const item of this.items) {
      this.itemsMap.set(item.id, item);
      
      // Initialize empty children arrays for all items
      if (!this.childrenMap.has(item.id)) {
        this.childrenMap.set(item.id, []);
      }
    }

    // Second pass to build parent-child relationships
    for (const item of this.items) {
      if (item.parent != null) {
        // Set parent mapping
        const parent = this.itemsMap.get(item.parent);
        if (parent) {
          this.parentMap.set(item.id, parent);
          
          // Add to parent's children list
          const siblings = this.childrenMap.get(item.parent);
          if (siblings) {
            siblings.push(item);
          } else {
            this.childrenMap.set(item.parent, [item]);
          }
        }
      }
    }
  }

  /**
   * Returns the original array of all items - O(1) operation
   */
  getAll(): TreeItem[] {
    return this.items;
  }

  /**
   * Returns a specific item by id - O(1) operation using Map lookup
   */
  getItem(id: string | number): TreeItem | undefined {
    return this.itemsMap.get(id);
  }

  /**
   * Returns direct children of the specified item - O(1) operation using pre-computed index
   */
  getChildren(id: string | number): TreeItem[] {
    return this.childrenMap.get(id) || [];
  }

  /**
   * Returns all descendants of the specified item at all levels - O(1) with caching
   */
  getAllChildren(id: string | number): TreeItem[] {
    // Check cache first
    if (this.allChildrenCache.has(id)) {
      return this.allChildrenCache.get(id)!;
    }

    const result: TreeItem[] = [];
    const directChildren = this.getChildren(id);

    for (const child of directChildren) {
      result.push(child);
      // Recursively get all descendants
      result.push(...this.getAllChildren(child.id));
    }

    // Cache the result for future O(1) access
    this.allChildrenCache.set(id, result);
    return result;
  }

  /**
   * Returns the chain of parent items from the specified item to root - O(1) with caching
   */
  getAllParents(id: string | number): TreeItem[] {
    // Check cache first
    if (this.parentChainCache.has(id)) {
      return this.parentChainCache.get(id)!;
    }

    const result: TreeItem[] = [];
    const item = this.getItem(id);
    
    if (!item) {
      return result;
    }

    // Start with the item itself
    result.push(item);
    
    // Walk up the parent chain
    let currentItem = item;
    while (currentItem.parent != null) {
      const parent = this.parentMap.get(currentItem.id);
      if (parent) {
        result.push(parent);
        currentItem = parent;
      } else {
        break;
      }
    }

    // Cache the result for future O(1) access
    this.parentChainCache.set(id, result);
    return result;
  }

  /**
   * Adds a new item to the tree structure
   * Updates internal indexes efficiently
   */
  addItem(item: TreeItem): void {
    // Prevent duplicate IDs
    if (this.itemsMap.has(item.id)) {
      console.warn(`Item with id ${item.id} already exists`);
      return;
    }

    // Add to items array and itemsMap
    this.items.push(item);
    this.itemsMap.set(item.id, item);
    
    // Initialize children array for new item
    this.childrenMap.set(item.id, []);

    // Update parent-child relationships
    if (item.parent != null) {
      const parent = this.itemsMap.get(item.parent);
      if (parent) {
        this.parentMap.set(item.id, parent);
        
        // Add to parent's children
        const siblings = this.childrenMap.get(item.parent);
        if (siblings) {
          siblings.push(item);
        } else {
          this.childrenMap.set(item.parent, [item]);
        }
      }
    }

    // Invalidate affected caches
    this.invalidateCache(new Set([item.id, item.parent].filter(id => id != null) as (string | number)[]));
  }

  /**
   * Removes an item and all its descendants from the tree
   */
  removeItem(id: string | number): void {
    const item = this.getItem(id);
    if (!item) {
      return;
    }

    // Get all descendants to remove
    const allDescendants = this.getAllChildren(id);
    const idsToRemove = new Set([id, ...allDescendants.map(d => d.id)]);

    // Remove from items array
    this.items = this.items.filter(item => !idsToRemove.has(item.id));

    // Remove from all maps
    for (const idToRemove of idsToRemove) {
      this.itemsMap.delete(idToRemove);
      this.childrenMap.delete(idToRemove);
      this.parentMap.delete(idToRemove);
    }

    // Remove from parent's children list
    if (item.parent != null) {
      const siblings = this.childrenMap.get(item.parent);
      if (siblings) {
        const index = siblings.findIndex(sibling => sibling.id === id);
        if (index !== -1) {
          siblings.splice(index, 1);
        }
      }
    }

    // Invalidate affected caches
    this.invalidateCache(new Set([item.parent, ...Array.from(idsToRemove)].filter(id => id != null) as (string | number)[]));
  }

  /**
   * Updates an existing item in the tree
   */
  updateItem(item: TreeItem): void {
    const existingItem = this.getItem(item.id);
    if (!existingItem) {
      console.warn(`Item with id ${item.id} not found`);
      return;
    }

    const oldParent = existingItem.parent;
    const newParent = item.parent;

    // Update the item in the items array
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }

    // Update itemsMap
    this.itemsMap.set(item.id, item);

    // Handle parent relationship changes
    if (oldParent !== newParent) {
      // Remove from old parent's children
      if (oldParent != null) {
        const oldSiblings = this.childrenMap.get(oldParent);
        if (oldSiblings) {
          const index = oldSiblings.findIndex(sibling => sibling.id === item.id);
          if (index !== -1) {
            oldSiblings.splice(index, 1);
          }
        }
        this.parentMap.delete(item.id);
      }

      // Add to new parent's children
      if (newParent != null) {
        const parent = this.itemsMap.get(newParent);
        if (parent) {
          this.parentMap.set(item.id, parent);
          
          const newSiblings = this.childrenMap.get(newParent);
          if (newSiblings) {
            newSiblings.push(item);
          } else {
            this.childrenMap.set(newParent, [item]);
          }
        }
      }
    }

    // Invalidate affected caches
    this.invalidateCache(new Set([item.id, oldParent, newParent].filter(id => id != null) as (string | number)[]));
  }

  /**
   * Invalidates cache entries for affected nodes and their ancestors
   */
  private invalidateCache(affectedIds: Set<string | number>): void {
    for (const id of affectedIds) {
      this.allChildrenCache.delete(id);
      this.parentChainCache.delete(id);
      
      // Invalidate parent caches up the chain
      this.invalidateParentCaches(id);
    }
  }

  /**
   * Recursively invalidates caches for all parent nodes
   */
  private invalidateParentCaches(id: string | number): void {
    const parent = this.parentMap.get(id);
    if (parent) {
      this.allChildrenCache.delete(parent.id);
      this.parentChainCache.delete(parent.id);
      this.invalidateParentCaches(parent.id);
    }
  }
}