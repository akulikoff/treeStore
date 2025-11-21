/**
 * Core TreeItem interface representing a node in the tree structure
 */
export interface TreeItem {
  /** Unique identifier for the tree item */
  id: string | number;
  /** Reference to parent item's id, null/undefined for root items */
  parent?: string | number | null;
  /** Additional arbitrary fields */
  [key: string]: unknown;
}

/**
 * Interface for the TreeStore class that manages hierarchical data
 */
export interface TreeStoreInterface {
  /** Returns the original array of all items */
  getAll(): TreeItem[];
  /** Returns a specific item by id or undefined if not found */
  getItem(id: string | number): TreeItem | undefined;
  /** Returns direct children of the specified item */
  getChildren(id: string | number): TreeItem[];
  /** Returns all descendants of the specified item at all levels */
  getAllChildren(id: string | number): TreeItem[];
  /** Returns the chain of parent items from the specified item to root */
  getAllParents(id: string | number): TreeItem[];
  /** Adds a new item to the tree structure */
  addItem(item: TreeItem): void;
  /** Removes an item and all its descendants from the tree */
  removeItem(id: string | number): void;
  /** Updates an existing item in the tree */
  updateItem(item: TreeItem): void;
}

/**
 * Props interface for the TreeTable Vue component
 */
export interface TreeTableProps {
  /** TreeStore instance containing the hierarchical data */
  treeStore: TreeStoreInterface;
  /** Optional column definitions for the table */
  columns?: ColumnConfig[];
}

/**
 * Extended TreeItem interface for table row data with additional display properties
 */
export interface TreeRowData extends TreeItem {
  /** Sequential row number in the table (computed dynamically) */
  rowNumber?: number;
  /** Category of the item: "Группа" for items with children, "Элемент" for leaf nodes */
  category: "Группа" | "Элемент";
  /** Nesting level in the hierarchy */
  level: number;
  /** Whether this item has children */
  hasChildren: boolean;
  /** Current expansion state (optional) */
  expanded?: boolean;
}

/**
 * Column configuration interface for AG Grid
 */
export interface ColumnConfig {
  /** Field name to display */
  field: string;
  /** Header text for the column */
  headerName: string;
  /** Optional column width */
  width?: number;
  /** Optional custom cell renderer */
  cellRenderer?: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column has filtering enabled */
  filter?: boolean;
}