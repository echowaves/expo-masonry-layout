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
 * @returns Layout data with positioned rows and items
 */
export function calculateRowMasonryLayout(
  data: MasonryItem[],
  screenWidth: number,
  spacing: number = 6,
  baseHeight: number = 100,
  maxItemsPerRow: number = 6,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS
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
      const aspectRatio = calculateAspectRatio(
        item,
        globalItemIndex + i,
        aspectRatioFallbacks
      );

      const scaledWidth = Math.floor(baseHeight * aspectRatio);
      const spacingNeeded = currentRowItems.length > 0 ? spacing : 0;
      const wouldFitInRow =
        currentRowWidth + scaledWidth + spacingNeeded <= availableWidth;

      if (wouldFitInRow) {
        currentRowItems.push({
          ...item,
          width: scaledWidth,
          height: baseHeight,
          masonryIndex: globalItemIndex + i,
          aspectRatio,
          left: 0, // Will be calculated later
          top: 0, // Will be calculated later
        });
        currentRowWidth += scaledWidth + spacingNeeded;
      } else {
        // Row is full, stop adding items
        break;
      }
    }

    // Ensure at least one item per row to prevent infinite loops
    if (currentRowItems.length === 0 && remainingItems.length > 0) {
      const item = remainingItems[0];
      const aspectRatio = calculateAspectRatio(
        item,
        globalItemIndex,
        aspectRatioFallbacks
      );

      currentRowItems.push({
        ...item,
        width: Math.floor(baseHeight * aspectRatio),
        height: baseHeight,
        masonryIndex: globalItemIndex,
        aspectRatio,
        left: 0,
        top: 0,
      });
    }

    // Step 2: Normalize heights (they should already be baseHeight)
    const maxHeight = Math.max(...currentRowItems.map(item => item.height));
    currentRowItems.forEach(item => {
      if (item.height !== maxHeight) {
        const heightScaleFactor = maxHeight / item.height;
        item.width = Math.floor(item.width * heightScaleFactor);
        item.height = maxHeight;
      }
    });

    // Step 3: Scale entire row to fit available width
    const totalItemWidth = currentRowItems.reduce(
      (sum, item) => sum + item.width,
      0
    );
    const totalSpacing = (currentRowItems.length - 1) * spacing;
    const totalUsedWidth = totalItemWidth + totalSpacing;

    if (totalUsedWidth > 0) {
      const widthRatio = availableWidth / totalUsedWidth;

      currentRowItems.forEach(item => {
        item.width = Math.floor(item.width * widthRatio);
        item.height = Math.floor(item.height * widthRatio);
      });
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
