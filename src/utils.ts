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
 * Get aspect ratio from item or fallback
 */
function getAspectRatio (
  item: MasonryItem,
  itemIndex: number,
  aspectRatioFallbacks: number[]
): number {
  if (item.width != null && item.height != null && item.width > 0 && item.height > 0) {
    return item.width / item.height
  }

  if (item.id != null && item.id !== '') {
    const seed = item.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return aspectRatioFallbacks[seed % aspectRatioFallbacks.length]
  }

  return aspectRatioFallbacks[itemIndex % aspectRatioFallbacks.length]
}

/**
 * Calculate dimensions for an item
 */
function calculateItemDimensions (
  item: MasonryItem,
  itemIndex: number,
  baseHeight: number,
  aspectRatioFallbacks: number[],
  preserveItemDimensions: boolean,
  customDimensionsFn?: (item: MasonryItem, index: number) => { width: number, height: number } | null
): { width: number, height: number } {
  const customDims = customDimensionsFn?.(item, itemIndex)
  if (customDims != null && customDims.width > 0 && customDims.height > 0) {
    return customDims
  }

  if ((preserveItemDimensions || item.preserveDimensions === true) &&
      item.width != null && item.height != null && item.width > 0 && item.height > 0) {
    return { width: item.width, height: item.height }
  }

  const aspectRatio = getAspectRatio(item, itemIndex, aspectRatioFallbacks)
  return { width: Math.floor(baseHeight * aspectRatio), height: baseHeight }
}

type PositionedMasonryItem = MasonryItem & {
  width: number
  height: number
  masonryIndex: number
  aspectRatio: number
  left: number
  top: number
}

/**
 * High-performance row-based masonry layout calculation
 */
export function calculateRowMasonryLayout (
  data: MasonryItem[],
  screenWidth: number,
  spacing: number = 6,
  baseHeight: number = 100,
  maxItemsPerRow: number = 6,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS,
  preserveItemDimensions: boolean = false,
  customDimensionsFn?: (item: MasonryItem, index: number) => { width: number, height: number } | null
): MasonryLayoutData {
  const rows: MasonryRowData[] = []
  const availableWidth = screenWidth - spacing * 2

  for (let startIdx = 0; startIdx < data.length;) {
    const currentRowItems: PositionedMasonryItem[] = []
    let currentRowWidth = 0

    // Fill row with items
    const endIdx = Math.min(startIdx + maxItemsPerRow, data.length)
    for (let i = startIdx; i < endIdx; i++) {
      const item = data[i]
      const dimensions = calculateItemDimensions(item, i, baseHeight, aspectRatioFallbacks, preserveItemDimensions, customDimensionsFn)
      const spacingNeeded = currentRowItems.length > 0 ? spacing : 0

      if (currentRowWidth + dimensions.width + spacingNeeded > availableWidth && currentRowItems.length > 0) break

      currentRowItems.push({
        ...item,
        ...dimensions,
        masonryIndex: i,
        aspectRatio: dimensions.width / dimensions.height,
        left: 0,
        top: 0
      })
      currentRowWidth += dimensions.width + spacingNeeded
    }

    // Check for preserved dimensions
    const hasPreservedItems = currentRowItems.some((item) =>
      (preserveItemDimensions || item.preserveDimensions === true) && item.width != null && item.height != null
    )

    // Normalize and scale if no preserved items
    if (!hasPreservedItems) {
      const maxHeight = Math.max(...currentRowItems.map((item) => item.height))
      const totalItemWidth = currentRowItems.reduce((sum, item) => {
        const scale = maxHeight / item.height
        item.width = Math.floor(item.width * scale)
        item.height = maxHeight
        return sum + item.width
      }, 0)

      const widthRatio = availableWidth / (totalItemWidth + (currentRowItems.length - 1) * spacing)
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

    rows.push({ items: currentRowItems, height: finalRowHeight, top: 0, rowIndex: rows.length })
    startIdx += currentRowItems.length
  }

  // Calculate row vertical positions
  let totalHeight = 0
  rows.forEach((row) => {
    row.top = totalHeight
    totalHeight += row.height + spacing
  })

  return { rows, totalHeight }
}
