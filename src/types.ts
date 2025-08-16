import React from 'react';
import { VirtualizedListProps } from 'react-native';

export interface MasonryItem {
  id: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface MasonryDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface MasonryRowData {
  items: (MasonryItem &
    MasonryDimensions & { masonryIndex: number; aspectRatio: number })[];
  height: number;
  top: number;
  rowIndex: number;
}

export interface MasonryLayoutData {
  rows: MasonryRowData[];
  totalHeight: number;
}

export interface MasonryRenderItemInfo {
  item: MasonryItem;
  index: number;
  dimensions: MasonryDimensions;
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
  data: MasonryItem[];

  /**
   * Function to render each item
   */
  renderItem: (info: MasonryRenderItemInfo) => React.ReactElement;

  /**
   * Spacing between items in pixels
   * @default 6
   */
  spacing?: number;

  /**
   * Maximum number of items per row
   * @default 6
   */
  maxItemsPerRow?: number;

  /**
   * Base height for scaling calculations
   * @default 100
   */
  baseHeight?: number;

  /**
   * Fallback aspect ratios when image dimensions are not available
   * @default [0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]
   */
  aspectRatioFallbacks?: number[];

  /**
   * Function to extract a unique key for each item
   */
  keyExtractor?: (item: MasonryItem, index: number) => string;
}

export interface MasonryLayoutUtils {
  calculateRowMasonryLayout: (
    data: MasonryItem[],
    screenWidth: number,
    spacing?: number,
    baseHeight?: number,
    maxItemsPerRow?: number,
    aspectRatioFallbacks?: number[]
  ) => MasonryLayoutData;
}
