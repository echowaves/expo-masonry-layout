import { MasonryItem, MasonryLayoutData, MasonryRowData, MasonryBandData, ColumnsConfig } from './types'

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
  extraHeight: number
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
  customDimensionsFn?: (item: MasonryItem, index: number) => { width: number, height: number } | null,
  getExtraHeight?: (item: MasonryItem, computedWidth: number) => number
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
        top: 0,
        extraHeight: 0
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
    let finalRowHeight = Math.max(...currentRowItems.map((item) => item.height))

    // Pass 2: apply getExtraHeight after widths are finalized
    if (getExtraHeight != null) {
      currentRowItems.forEach((item) => {
        item.extraHeight = getExtraHeight(item, item.width)
      })
      const maxTotalHeight = Math.max(...currentRowItems.map((item) => item.height + item.extraHeight))
      finalRowHeight = maxTotalHeight
    }

    let currentLeft = spacing
    currentRowItems.forEach((item) => {
      item.left = currentLeft
      item.top = (finalRowHeight - item.height - item.extraHeight) / 2
      item.height = item.height + item.extraHeight
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

/**
 * Resolve responsive column count from ColumnsConfig and screen width
 */
export function resolveColumnCount (columns: ColumnsConfig, screenWidth: number): number {
  if (typeof columns === 'number') return columns

  const breakpoints = Object.keys(columns)
    .filter((k) => k !== 'default')
    .map(Number)
    .sort((a, b) => a - b)

  for (const bp of breakpoints) {
    if (screenWidth <= bp) {
      return columns[bp]
    }
  }

  return columns.default
}

type ColumnPositionedItem = MasonryItem & {
  width: number
  height: number
  masonryIndex: number
  aspectRatio: number
  left: number
  top: number
  extraHeight: number
  columnIndex: number
  isExpanded: boolean
}

/**
 * Column-based masonry layout calculation
 */
export function calculateColumnMasonryLayout (
  data: MasonryItem[],
  screenWidth: number,
  numColumns: number,
  spacing: number = 6,
  aspectRatioFallbacks: number[] = DEFAULT_ASPECT_RATIOS,
  getExtraHeight?: (item: MasonryItem, computedWidth: number) => number,
  expandedItemIds?: string[],
  getExpandedHeight?: (item: MasonryItem, fullWidth: number) => number
): { items: ColumnPositionedItem[], totalHeight: number } {
  const availableWidth = screenWidth - spacing * (numColumns + 1)
  const columnWidth = Math.floor(availableWidth / numColumns)
  const fullWidth = screenWidth - spacing * 2
  const columnHeights = new Array(numColumns).fill(0) as number[]
  const positionedItems: ColumnPositionedItem[] = []
  const expandedSet = new Set(expandedItemIds ?? [])

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const isExpanded = expandedSet.has(item.id)

    if (isExpanded && getExpandedHeight != null) {
      // Flush all columns to waterline
      const waterline = Math.max(...columnHeights, 0)
      const expandedHeight = getExpandedHeight(item, fullWidth)
      const aspectRatio = getAspectRatio(item, i, aspectRatioFallbacks)

      positionedItems.push({
        ...item,
        width: fullWidth,
        height: expandedHeight,
        masonryIndex: i,
        aspectRatio,
        left: spacing,
        top: waterline,
        extraHeight: 0,
        columnIndex: -1,
        isExpanded: true
      })

      // Reset all column heights below the expanded item
      const newHeight = waterline + expandedHeight + spacing
      for (let c = 0; c < numColumns; c++) {
        columnHeights[c] = newHeight
      }
    } else {
      const aspectRatio = getAspectRatio(item, i, aspectRatioFallbacks)
      const imageHeight = Math.floor(columnWidth / aspectRatio)
      const extraHeight = getExtraHeight != null ? getExtraHeight(item, columnWidth) : 0
      const totalHeight = imageHeight + extraHeight

      // Find shortest column
      let shortestCol = 0
      for (let c = 1; c < numColumns; c++) {
        if (columnHeights[c] < columnHeights[shortestCol]) {
          shortestCol = c
        }
      }

      const left = spacing + shortestCol * (columnWidth + spacing)
      const top = columnHeights[shortestCol]

      positionedItems.push({
        ...item,
        width: columnWidth,
        height: totalHeight,
        masonryIndex: i,
        aspectRatio,
        left,
        top,
        extraHeight,
        columnIndex: shortestCol,
        isExpanded: false
      })

      columnHeights[shortestCol] += totalHeight + spacing
    }
  }

  const totalHeight = Math.max(...columnHeights, 0)
  return { items: positionedItems, totalHeight }
}

const DEFAULT_BAND_HEIGHT = 300

/**
 * Slice positioned items into horizontal bands for virtualization.
 * Expanded items become their own dedicated single-item bands.
 * Normal items between expansions are grouped into standard fixed-height bands.
 */
export function sliceIntoBands (
  items: ColumnPositionedItem[],
  totalHeight: number,
  bandHeight: number = DEFAULT_BAND_HEIGHT
): MasonryBandData[] {
  if (items.length === 0) return []

  // Separate expanded and normal items
  const expandedItems = items.filter((item) => item.isExpanded)
  const normalItems = items.filter((item) => !item.isExpanded)

  // Collect expansion boundaries (sorted by top position)
  const expansionBoundaries = expandedItems
    .map((item) => ({ top: item.top, bottom: item.top + item.height, item }))
    .sort((a, b) => a.top - b.top)

  const bands: MasonryBandData[] = []
  let bandIndex = 0

  // Build regions: alternating normal-item regions and expansion bands
  let regionStart = 0

  for (const expansion of expansionBoundaries) {
    // Create fixed-height bands for normal items before this expansion
    if (expansion.top > regionStart) {
      const regionNormalItems = normalItems.filter(
        (item) => item.top >= regionStart && item.top < expansion.top
      )
      const regionHeight = expansion.top - regionStart
      const numBands = Math.ceil(regionHeight / bandHeight)
      for (let b = 0; b < numBands; b++) {
        const bandTop = regionStart + b * bandHeight
        const bandBottom = bandTop + bandHeight
        bands.push({
          items: regionNormalItems.filter(
            (item) => item.top >= bandTop && item.top < bandBottom
          ),
          height: bandHeight,
          top: bandTop,
          bandIndex: bandIndex++
        })
      }
    }

    // Create dedicated band for the expanded item
    bands.push({
      items: [expansion.item],
      height: expansion.item.height,
      top: expansion.top,
      bandIndex: bandIndex++
    })

    regionStart = expansion.bottom
  }

  // Create fixed-height bands for normal items after the last expansion
  if (regionStart < totalHeight) {
    const regionNormalItems = normalItems.filter(
      (item) => item.top >= regionStart
    )
    const regionHeight = totalHeight - regionStart
    const numBands = Math.ceil(regionHeight / bandHeight)
    for (let b = 0; b < numBands; b++) {
      const bandTop = regionStart + b * bandHeight
      const bandBottom = bandTop + bandHeight
      bands.push({
        items: regionNormalItems.filter(
          (item) => item.top >= bandTop && item.top < bandBottom
        ),
        height: bandHeight,
        top: bandTop,
        bandIndex: bandIndex++
      })
    }
  }

  return bands
}
