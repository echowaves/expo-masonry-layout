import { MasonryItem, MasonryLayoutData, MasonryRowData } from './types';

/**
 * Default aspect ratios for when image dimensions are not available
 * Covers common photo/image ratios from portrait to landscape
 */
const DEFAULT_ASPECT_RATIOS = [
  0.56, // 9:16 (portrait)
  0.67, // 2:3 (portrait)
  0.75, // 3:4 (portrait)
  1.0, // 1:1 (square)
  1.33, // 4:3 (landscape)
  1.5, // 3:2 (landscape)
  1.78, // 16:9 (landscape)
];

/**
 * Calculates dimensions for an item using various strategies
 */
function calculateItemDimensions(
  item: MasonryItem,
  itemIndex: number,
  baseHeight: number,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS,
  preserveItemDimensions: boolean = false,
  getItemDimensions?: (
    item: MasonryItem,
    index: number
  ) => { width: number; height: number } | null
): { width: number; height: number } {
  // First priority: Custom dimension function
  if (getItemDimensions) {
    const customDimensions = getItemDimensions(item, itemIndex);
    if (
      customDimensions &&
      customDimensions.width > 0 &&
      customDimensions.height > 0
    ) {
      return customDimensions;
    }
  }

  // Second priority: Preserve exact dimensions if requested and available
  if (preserveItemDimensions || item.preserveDimensions) {
    if (item.width && item.height && item.width > 0 && item.height > 0) {
      return { width: item.width, height: item.height };
    }
  }

  // Third priority: Calculate from aspect ratio
  const aspectRatio = calculateAspectRatio(
    item,
    itemIndex,
    aspectRatioFallbacks
  );
  return {
    width: Math.floor(baseHeight * aspectRatio),
    height: baseHeight,
  };
}

/**
 * Calculates aspect ratio for an item using various fallback strategies
 */
function calculateAspectRatio(
  item: MasonryItem,
  itemIndex: number,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS
): number {
  // First priority: Use actual image dimensions if available
  if (item.width && item.height && item.width > 0 && item.height > 0) {
    return item.width / item.height;
  }

  // Second priority: Use item ID to generate consistent aspect ratio
  if (item.id) {
    const seed = item.id
      .toString()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return aspectRatioFallbacks[seed % aspectRatioFallbacks.length];
  }

  // Fallback: Use item index for consistent layout
  return aspectRatioFallbacks[itemIndex % aspectRatioFallbacks.length];
}

/**
 * High-performance row-based masonry layout calculation
 * Optimized for vertical scrolling with justified rows
 *
 * @param data - Array of items to layout
 * @param screenWidth - Available width for layout
 * @param spacing - Space between items (default: 6)
 * @param baseHeight - Base height for initial scaling (default: 100)
 * @param maxItemsPerRow - Maximum items per row (default: 6)
 * @param aspectRatioFallbacks - Fallback aspect ratios
 * @param preserveItemDimensions - Whether to respect exact item dimensions
 * @param getItemDimensions - Custom dimension calculation function
 * @returns Layout data with positioned rows and items
 */
export function calculateRowMasonryLayout(
  data: MasonryItem[],
  screenWidth: number,
  spacing: number = 6,
  baseHeight: number = 100,
  maxItemsPerRow: number = 6,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS,
  preserveItemDimensions: boolean = false,
  getItemDimensions?: (
    item: MasonryItem,
    index: number
  ) => { width: number; height: number } | null
): MasonryLayoutData {
  const rows: MasonryRowData[] = [];
  const availableWidth = screenWidth - spacing * 2; // Account for left/right padding

  let remainingItems = [...data];
  let globalItemIndex = 0;

  while (remainingItems.length > 0) {
    const currentRowItems: Array<
      MasonryItem & {
        width: number;
        height: number;
        masonryIndex: number;
        aspectRatio: number;
        left: number;
        top: number;
      }
    > = [];
    let currentRowWidth = 0;

    // Step 1: Fill row with items scaled to base height
    for (
      let i = 0;
      i < remainingItems.length && currentRowItems.length < maxItemsPerRow;
      i++
    ) {
      const item = remainingItems[i];
      const dimensions = calculateItemDimensions(
        item,
        globalItemIndex + i,
        baseHeight,
        aspectRatioFallbacks,
        preserveItemDimensions,
        getItemDimensions
      );

      const spacingNeeded = currentRowItems.length > 0 ? spacing : 0;
      const wouldFitInRow =
        currentRowWidth + dimensions.width + spacingNeeded <= availableWidth;

      if (wouldFitInRow) {
        // For items with preserved dimensions, we need to track the aspect ratio
        const aspectRatio = dimensions.width / dimensions.height;

        currentRowItems.push({
          ...item,
          width: dimensions.width,
          height: dimensions.height,
          masonryIndex: globalItemIndex + i,
          aspectRatio,
          left: 0, // Will be calculated later
          top: 0, // Will be calculated later
        });
        currentRowWidth += dimensions.width + spacingNeeded;
      } else {
        // Row is full, stop adding items
        break;
      }
    }

    // Ensure at least one item per row to prevent infinite loops
    if (currentRowItems.length === 0 && remainingItems.length > 0) {
      const item = remainingItems[0];
      const dimensions = calculateItemDimensions(
        item,
        globalItemIndex,
        baseHeight,
        aspectRatioFallbacks,
        preserveItemDimensions,
        getItemDimensions
      );
      const aspectRatio = dimensions.width / dimensions.height;

      currentRowItems.push({
        ...item,
        width: dimensions.width,
        height: dimensions.height,
        masonryIndex: globalItemIndex,
        aspectRatio,
        left: 0,
        top: 0,
      });
    }

    // Step 2: Normalize heights for auto-calculated items only
    // Items with preserved dimensions should maintain their exact size
    const hasPreservedItems = currentRowItems.some(
      item =>
        (preserveItemDimensions || item.preserveDimensions) &&
        item.width &&
        item.height
    );

    if (!hasPreservedItems) {
      // Original behavior: normalize all heights
      const maxHeight = Math.max(...currentRowItems.map(item => item.height));
      currentRowItems.forEach(item => {
        if (item.height !== maxHeight) {
          const heightScaleFactor = maxHeight / item.height;
          item.width = Math.floor(item.width * heightScaleFactor);
          item.height = maxHeight;
        }
      });
    }

    // Step 3: Scale row to fit available width (but respect preserved dimensions)
    const totalItemWidth = currentRowItems.reduce(
      (sum, item) => sum + item.width,
      0
    );
    const totalSpacing = (currentRowItems.length - 1) * spacing;
    const totalUsedWidth = totalItemWidth + totalSpacing;

    if (totalUsedWidth > 0 && !hasPreservedItems) {
      // Only scale if no items have preserved dimensions
      const widthRatio = availableWidth / totalUsedWidth;

      currentRowItems.forEach(item => {
        item.width = Math.floor(item.width * widthRatio);
        item.height = Math.floor(item.height * widthRatio);
      });
    } else if (hasPreservedItems && totalUsedWidth > availableWidth) {
      // If preserved items overflow, we let them overflow to maintain exact dimensions
      // The layout will still work, items will just extend beyond the container width
    }

    // Step 4: Calculate final row height and positions
    const finalRowHeight = Math.max(
      ...currentRowItems.map(item => item.height)
    );

    // Position items within the row
    let currentLeft = spacing; // Start with left padding
    currentRowItems.forEach(item => {
      item.left = currentLeft;
      item.top = (finalRowHeight - item.height) / 2; // Center vertically in row
      currentLeft += item.width + spacing;
    });

    // Step 5: Create row data
    rows.push({
      items: currentRowItems,
      height: finalRowHeight,
      top: 0, // Will be calculated after all rows are processed
      rowIndex: rows.length,
    });

    // Remove processed items and update indices
    remainingItems = remainingItems.slice(currentRowItems.length);
    globalItemIndex += currentRowItems.length;
  }

  // Step 6: Calculate row positions and total height
  let totalHeight = 0;
  rows.forEach(row => {
    row.top = totalHeight;
    totalHeight += row.height + spacing;
  });

  return {
    rows,
    totalHeight,
  };
}

/**
 * Utility to get item dimensions from layout data
 */
export function getItemDimensions(
  item: MasonryItem,
  layoutData: MasonryLayoutData
): { width: number; height: number; left: number; top: number } | null {
  for (const row of layoutData.rows) {
    const foundItem = row.items.find(rowItem => rowItem.id === item.id);
    if (foundItem) {
      return {
        width: foundItem.width,
        height: foundItem.height,
        left: foundItem.left,
        top: row.top + foundItem.top,
      };
    }
  }
  return null;
}
