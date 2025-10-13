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
 * Check if item has preserved dimensions that should be respected
 */
function shouldPreserveDimensions (item: MasonryItem, preserveItemDimensions: boolean): boolean {
  return (preserveItemDimensions || item.preserveDimensions === true) &&
         item.width != null && item.height != null
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
    const currentRowItems: PositionedMasonryItem[] = []
    let currentRowWidth = 0

    // Fill row with items
    for (let i = 0; i < Math.min(remainingItems.length, maxItemsPerRow); i++) {
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
      const fitsInRow = currentRowWidth + dimensions.width + spacingNeeded <= availableWidth

      if (!fitsInRow && currentRowItems.length > 0) break

      currentRowItems.push({
        ...item,
        ...dimensions,
        masonryIndex: globalItemIndex + i,
        aspectRatio: dimensions.width / dimensions.height,
        left: 0,
        top: 0
      })
      currentRowWidth += dimensions.width + spacingNeeded
    }

    // Check for preserved dimensions in row
    const hasPreservedItems = currentRowItems.some((item) =>
      shouldPreserveDimensions(item, preserveItemDimensions)
    )

    // Normalize and scale items
    if (!hasPreservedItems) {
      const maxHeight = Math.max(...currentRowItems.map((item) => item.height))
      currentRowItems.forEach((item) => {
        const scale = maxHeight / item.height
        item.width = Math.floor(item.width * scale)
        item.height = maxHeight
      })

      const totalItemWidth = currentRowItems.reduce((sum, item) => sum + item.width, 0)
      const totalSpacing = (currentRowItems.length - 1) * spacing
      const widthRatio = availableWidth / (totalItemWidth + totalSpacing)

      currentRowItems.forEach((item) => {
        item.width = Math.floor(item.width * widthRatio)
        item.height = Math.floor(item.height * widthRatio)
      })
    }

    // Position items
    const finalRowHeight = Math.max(...currentRowItems.map((item) => item.height))
    let currentLeft = spacing
    currentRowItems.forEach((item) => {
      item.left = currentLeft
      item.top = (finalRowHeight - item.height) / 2
      currentLeft += item.width + spacing
    })

    // Add row
    rows.push({
      items: currentRowItems,
      height: finalRowHeight,
      top: 0,
      rowIndex: rows.length
    })

    remainingItems = remainingItems.slice(currentRowItems.length)
    globalItemIndex += currentRowItems.length
  }

  // Calculate row positions
  let totalHeight = 0
  rows.forEach((row) => {
    row.top = totalHeight
    totalHeight += row.height + spacing
  })

  return { rows, totalHeight }
}
