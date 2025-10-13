import { MasonryItem, MasonryLayoutData, MasonryRowData } from './types'

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
  1.78 // 16:9 (landscape)
]

/**
 * Calculates dimensions for an item using various strategies
 */
function calculateItemDimensions (
  item: MasonryItem,
  itemIndex: number,
  baseHeight: number,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS,
  preserveItemDimensions: boolean = false,
  customDimensionsFn?: (
    item: MasonryItem,
    index: number
  ) => { width: number, height: number } | null
): { width: number, height: number } {
  // First priority: Custom dimension function
  if (customDimensionsFn != null) {
    const customDimensions = customDimensionsFn(item, itemIndex)
    if ((customDimensions != null) && customDimensions.width > 0 && customDimensions.height > 0) {
      return customDimensions
    }
  }

  // Second priority: Preserve exact dimensions if requested and available
  if (preserveItemDimensions || (item.preserveDimensions === true)) {
    if (item.width != null && item.height != null && item.width > 0 && item.height > 0) {
      return { width: item.width, height: item.height }
    }
  }

  // Third priority: Calculate from aspect ratio
  const aspectRatio = calculateAspectRatio(item, itemIndex, aspectRatioFallbacks)
  return {
    width: Math.floor(baseHeight * aspectRatio),
    height: baseHeight
  }
}

/**
 * Calculates aspect ratio for an item using various fallback strategies
 */
function calculateAspectRatio (
  item: MasonryItem,
  itemIndex: number,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS
): number {
  // First priority: Use actual image dimensions if available
  if (item.width != null && item.height != null && item.width > 0 && item.height > 0) {
    return item.width / item.height
  }

  // Second priority: Use item ID to generate consistent aspect ratio
  if (item.id != null && item.id !== '') {
    const seed = item.id
      .toString()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return aspectRatioFallbacks[seed % aspectRatioFallbacks.length]
  }

  // Fallback: Use item index for consistent layout
  return aspectRatioFallbacks[itemIndex % aspectRatioFallbacks.length]
}

/**
 * Type for positioned masonry item within a row
 */
type PositionedMasonryItem = MasonryItem & {
  width: number
  height: number
  masonryIndex: number
  aspectRatio: number
  left: number
  top: number
}

/**
 * Fill a row with items scaled to base height
 */
function fillRowWithItems (
  remainingItems: MasonryItem[],
  globalItemIndex: number,
  availableWidth: number,
  spacing: number,
  maxItemsPerRow: number,
  baseHeight: number,
  aspectRatioFallbacks: number[],
  preserveItemDimensions: boolean,
  customDimensionsFn?: (item: MasonryItem, index: number) => { width: number, height: number } | null
): PositionedMasonryItem[] {
  const currentRowItems: PositionedMasonryItem[] = []
  let currentRowWidth = 0

  for (let i = 0; i < remainingItems.length && currentRowItems.length < maxItemsPerRow; i++) {
    const item = remainingItems[i]
    const dimensions = calculateItemDimensions(
      item,
      globalItemIndex + i,
      baseHeight,
      aspectRatioFallbacks,
      preserveItemDimensions,
      customDimensionsFn
    )

    const spacingNeeded = currentRowItems.length > 0 ? spacing : 0
    const wouldFitInRow = currentRowWidth + dimensions.width + spacingNeeded <= availableWidth

    if (wouldFitInRow) {
      const aspectRatio = dimensions.width / dimensions.height
      currentRowItems.push({
        ...item,
        width: dimensions.width,
        height: dimensions.height,
        masonryIndex: globalItemIndex + i,
        aspectRatio,
        left: 0,
        top: 0
      })
      currentRowWidth += dimensions.width + spacingNeeded
    } else {
      break
    }
  }

  return currentRowItems
}

/**
 * Ensure at least one item per row to prevent infinite loops
 */
function ensureMinimumRowItems (
  currentRowItems: PositionedMasonryItem[],
  remainingItems: MasonryItem[],
  globalItemIndex: number,
  baseHeight: number,
  aspectRatioFallbacks: number[],
  preserveItemDimensions: boolean,
  customDimensionsFn?: (item: MasonryItem, index: number) => { width: number, height: number } | null
): PositionedMasonryItem[] {
  if (currentRowItems.length === 0 && remainingItems.length > 0) {
    const item = remainingItems[0]
    const dimensions = calculateItemDimensions(
      item,
      globalItemIndex,
      baseHeight,
      aspectRatioFallbacks,
      preserveItemDimensions,
      customDimensionsFn
    )
    const aspectRatio = dimensions.width / dimensions.height

    return [{
      ...item,
      width: dimensions.width,
      height: dimensions.height,
      masonryIndex: globalItemIndex,
      aspectRatio,
      left: 0,
      top: 0
    }]
  }
  return currentRowItems
}

/**
 * Normalize heights for items without preserved dimensions
 */
function normalizeItemHeights (
  items: PositionedMasonryItem[],
  hasPreservedItems: boolean
): void {
  if (!hasPreservedItems) {
    const maxHeight = Math.max(...items.map((item) => item.height))
    items.forEach((item) => {
      if (item.height !== maxHeight) {
        const heightScaleFactor = maxHeight / item.height
        item.width = Math.floor(item.width * heightScaleFactor)
        item.height = maxHeight
      }
    })
  }
}

/**
 * Scale row items to fit available width
 */
function scaleRowToFitWidth (
  items: PositionedMasonryItem[],
  availableWidth: number,
  spacing: number,
  hasPreservedItems: boolean
): void {
  const totalItemWidth = items.reduce((sum, item) => sum + item.width, 0)
  const totalSpacing = (items.length - 1) * spacing
  const totalUsedWidth = totalItemWidth + totalSpacing

  if (totalUsedWidth > 0 && !hasPreservedItems) {
    const widthRatio = availableWidth / totalUsedWidth
    items.forEach((item) => {
      item.width = Math.floor(item.width * widthRatio)
      item.height = Math.floor(item.height * widthRatio)
    })
  }
}

/**
 * Position items within a row
 */
function positionItemsInRow (
  items: PositionedMasonryItem[],
  spacing: number
): number {
  const finalRowHeight = Math.max(...items.map((item) => item.height))
  let currentLeft = spacing

  items.forEach((item) => {
    item.left = currentLeft
    item.top = (finalRowHeight - item.height) / 2
    currentLeft += item.width + spacing
  })

  return finalRowHeight
}

/**
 * Calculate vertical positions for all rows
 */
function calculateRowPositions (
  rows: MasonryRowData[],
  spacing: number
): number {
  let totalHeight = 0
  rows.forEach((row) => {
    row.top = totalHeight
    totalHeight += row.height + spacing
  })
  return totalHeight
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
 * @param customDimensionsFn - Custom dimension calculation function
 * @returns Layout data with positioned rows and items
 */
export function calculateRowMasonryLayout (
  data: MasonryItem[],
  screenWidth: number,
  spacing: number = 6,
  baseHeight: number = 100,
  maxItemsPerRow: number = 6,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS,
  preserveItemDimensions: boolean = false,
  customDimensionsFn?: (
    item: MasonryItem,
    index: number
  ) => { width: number, height: number } | null
): MasonryLayoutData {
  const rows: MasonryRowData[] = []
  const availableWidth = screenWidth - spacing * 2

  let remainingItems = [...data]
  let globalItemIndex = 0

  while (remainingItems.length > 0) {
    // Step 1: Fill row with items
    let currentRowItems = fillRowWithItems(
      remainingItems,
      globalItemIndex,
      availableWidth,
      spacing,
      maxItemsPerRow,
      baseHeight,
      aspectRatioFallbacks,
      preserveItemDimensions,
      customDimensionsFn
    )

    // Step 2: Ensure at least one item
    currentRowItems = ensureMinimumRowItems(
      currentRowItems,
      remainingItems,
      globalItemIndex,
      baseHeight,
      aspectRatioFallbacks,
      preserveItemDimensions,
      customDimensionsFn
    )

    // Step 3: Check for preserved dimensions
    const hasPreservedItems = currentRowItems.some(
      (item) => (preserveItemDimensions || item.preserveDimensions === true) && item.width != null && item.height != null
    )

    // Step 4: Normalize heights
    normalizeItemHeights(currentRowItems, hasPreservedItems)

    // Step 5: Scale row to fit width
    scaleRowToFitWidth(currentRowItems, availableWidth, spacing, hasPreservedItems)

    // Step 6: Position items
    const finalRowHeight = positionItemsInRow(currentRowItems, spacing)

    // Step 7: Create row data
    rows.push({
      items: currentRowItems,
      height: finalRowHeight,
      top: 0,
      rowIndex: rows.length
    })

    // Update state for next iteration
    remainingItems = remainingItems.slice(currentRowItems.length)
    globalItemIndex += currentRowItems.length
  }

  // Step 8: Calculate row positions and total height
  const totalHeight = calculateRowPositions(rows, spacing)

  return {
    rows,
    totalHeight
  }
}
