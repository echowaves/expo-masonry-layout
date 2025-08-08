import React from 'react';
import { ViewStyle } from 'react-native';

export interface MasonryItem {
  id: string;
  width?: number;
  height?: number;
  [key: string]: any;
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

export interface ExpoMasonryLayoutProps {
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

  /**
   * Called when the user scrolls near the end of the content
   */
  onEndReached?: () => void;

  /**
   * Threshold for onEndReached (0.1 = 10% from bottom)
   * @default 0.1
   */
  onEndReachedThreshold?: number;

  /**
   * Whether the list is refreshing
   * @default false
   */
  refreshing?: boolean;

  /**
   * Called when user pulls to refresh
   */
  onRefresh?: () => void;

  /**
   * Performance: Initial number of items to render
   * @default 10
   */
  initialNumToRender?: number;

  /**
   * Performance: Maximum number of items to render per batch
   * @default 15
   */
  maxToRenderPerBatch?: number;

  /**
   * Performance: Window size for virtualization
   * @default 21
   */
  windowSize?: number;

  /**
   * Performance: Update cells batching period in ms
   * @default 100
   */
  updateCellsBatchingPeriod?: number;

  /**
   * Custom scroll event throttle
   * @default 16
   */
  scrollEventThrottle?: number;

  /**
   * Custom style for the container
   */
  style?: ViewStyle;

  /**
   * Custom style for the content container
   */
  contentContainerStyle?: ViewStyle;

  /**
   * Whether to show vertical scroll indicator
   * @default false
   */
  showsVerticalScrollIndicator?: boolean;

  /**
   * Whether to remove clipped subviews for performance
   * @default false
   */
  removeClippedSubviews?: boolean;
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
