import React from 'react'
import { VirtualizedListProps } from 'react-native'

export interface MasonryItem {
  id: string
  width?: number
  height?: number
  preserveDimensions?: boolean
  [key: string]: unknown
}

export interface MasonryDimensions {
  width: number
  height: number
  left: number
  top: number
}

export interface MasonryRowData {
  items: Array<MasonryItem & MasonryDimensions & { masonryIndex: number, aspectRatio: number, extraHeight: number }>
  height: number
  top: number
  rowIndex: number
}

export interface MasonryLayoutData {
  rows: MasonryRowData[]
  totalHeight: number
}

export type ColumnsConfig = number | { default: number, [breakpoint: number]: number }

export interface MasonryBandData {
  items: Array<MasonryItem & MasonryDimensions & { masonryIndex: number, aspectRatio: number, extraHeight: number, columnIndex: number, isExpanded: boolean }>
  height: number
  top: number
  bandIndex: number
}

export interface MasonryColumnLayoutData {
  bands: MasonryBandData[]
  totalHeight: number
}

export interface MasonryRenderItemInfo {
  item: MasonryItem
  index: number
  dimensions: MasonryDimensions
  extraHeight: number
  columnIndex?: number
  isExpanded: boolean
}

export interface ExpoMasonryLayoutProps
  extends Omit<
    VirtualizedListProps<MasonryRowData>,
    | 'data'
    | 'renderItem'
    | 'keyExtractor'
    | 'getItemCount'
    | 'getItem'
    | 'getItemLayout'
    | 'horizontal'
  > {
  /**
   * Array of data items to render in masonry layout
   */
  data: MasonryItem[]

  /**
   * Function to render each item
   */
  renderItem: (info: MasonryRenderItemInfo) => React.ReactElement

  /**
   * Layout mode: 'row' for horizontal row-based layout, 'column' for vertical column-based layout
   * @default 'row'
   */
  layoutMode?: 'row' | 'column'

  /**
   * Number of columns or responsive breakpoint config for column mode
   * @default 2
   */
  columns?: ColumnsConfig

  /**
   * Function to calculate extra height below the image area for each item
   * Receives the item and its computed width (after layout scaling)
   * Returns the extra height in pixels
   */
  getExtraHeight?: (item: MasonryItem, computedWidth: number) => number

  /**
   * Array of item IDs that are currently expanded to full width (column mode only)
   * When an item is expanded, it spans all columns at the current waterline
   */
  expandedItemIds?: string[]

  /**
   * Function to calculate the total height of an expanded item at full width
   * Required when expandedItemIds is non-empty
   */
  getExpandedHeight?: (item: MasonryItem, fullWidth: number) => number

  /**
   * Spacing between items in pixels
   * @default 6
   */
  spacing?: number

  /**
   * Maximum number of items per row
   * @default 6
   */
  maxItemsPerRow?: number

  /**
   * Base height for scaling calculations
   * @default 100
   */
  baseHeight?: number

  /**
   * Fallback aspect ratios when image dimensions are not available
   * @default [0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]
   */
  aspectRatioFallbacks?: number[]

  /**
   * Whether to respect exact item dimensions when provided
   * @default false
   */
  preserveItemDimensions?: boolean

  /**
   * Function to calculate custom dimensions for items
   * Return null to use auto-calculation
   */
  getItemDimensions?: (
    item: MasonryItem,
    index: number
  ) => { width: number, height: number } | null

  /**
   * Function to extract a unique key for each item
   */
  keyExtractor?: (item: MasonryItem, index: number) => string

  /**
   * Callback invoked when an item's layout dimensions are calculated
   * Provides the item, its index, and calculated dimensions
   */
  onItemLayout?: (info: MasonryRenderItemInfo) => void
}
