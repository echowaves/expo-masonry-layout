import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View, ViewStyle, VirtualizedList } from 'react-native'
import { ExpoMasonryLayoutHandle, ExpoMasonryLayoutProps, MasonryBandData, MasonryItem, MasonryRowData } from './types'
import { calculateColumnMasonryLayout, calculateRowMasonryLayout, diffExpandedIds, resolveColumnCount, selectScrollTarget, sliceIntoBands } from './utils'

/**
 * High-performance masonry layout component for React Native and Expo
 *
 * Features:
 * - Row-based masonry layout optimized for vertical scrolling
 * - Column-based masonry layout with responsive breakpoints
 * - VirtualizedList for performance with large datasets
 * - Automatic aspect ratio handling with fallbacks
 * - Pull-to-refresh and infinite scroll support
 * - TypeScript support with comprehensive prop types
 */
export const ExpoMasonryLayout = React.forwardRef<ExpoMasonryLayoutHandle, ExpoMasonryLayoutProps>(function ExpoMasonryLayout(props, ref): React.JSX.Element {
  const {
    data,
    renderItem,
    layoutMode = 'row',
    columns = 2,
    getExtraHeight,
    expandedItemIds,
    getExpandedHeight,
    spacing = 6,
    maxItemsPerRow = 6,
    baseHeight = 100,
    aspectRatioFallbacks,
    preserveItemDimensions = false,
    getItemDimensions,
    keyExtractor,
    onItemLayout,
    autoScrollOnExpand,
    onExpandedItemLayout,
    style,
    contentContainerStyle,
    ...virtualizedListProps
  } = props
  const { width: screenWidth } = useWindowDimensions()

  const listRef = useRef<VirtualizedList<any>>(null)
  const prevExpandedIdsRef = useRef<string[]>([])

  // Measured heights for expanded items (auto-measurement + notifyHeightChanged)
  const measuredHeightsRef = useRef<Map<string, number>>(new Map())
  const pendingMeasurementsRef = useRef<Map<string, number>>(new Map())
  const rafIdRef = useRef<number | null>(null)
  const [measurementGeneration, setMeasurementGeneration] = useState(0)

  const batchHeightUpdate = useCallback((itemId: string, height: number) => {
    const current = measuredHeightsRef.current.get(itemId)
    if (current != null && Math.abs(current - height) <= 1) return

    pendingMeasurementsRef.current.set(itemId, height)

    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        const pending = pendingMeasurementsRef.current
        if (pending.size === 0) return

        pending.forEach((h, id) => {
          measuredHeightsRef.current.set(id, h)
        })
        pending.clear()
        setMeasurementGeneration((g) => g + 1)
      })
    }
  }, [])

  const numColumns = useMemo(() => {
    if (layoutMode !== 'column') return 0
    return resolveColumnCount(columns, screenWidth)
  }, [layoutMode, columns, screenWidth])

  // Memoize layout calculation
  const rowLayoutData = useMemo(() => {
    if (layoutMode !== 'row') return null
    return calculateRowMasonryLayout(
      data,
      screenWidth,
      spacing,
      baseHeight,
      maxItemsPerRow,
      aspectRatioFallbacks,
      preserveItemDimensions,
      getItemDimensions,
      getExtraHeight,
      expandedItemIds,
      getExpandedHeight,
      measuredHeightsRef.current
    )
  }, [
    layoutMode,
    data,
    screenWidth,
    spacing,
    baseHeight,
    maxItemsPerRow,
    aspectRatioFallbacks,
    preserveItemDimensions,
    getItemDimensions,
    getExtraHeight,
    expandedItemIds,
    getExpandedHeight,
    measurementGeneration
  ])

  const columnLayoutData = useMemo(() => {
    if (layoutMode !== 'column') return null
    const { items, totalHeight } = calculateColumnMasonryLayout(
      data,
      screenWidth,
      numColumns,
      spacing,
      aspectRatioFallbacks,
      getExtraHeight,
      expandedItemIds,
      getExpandedHeight,
      measuredHeightsRef.current
    )
    const bands = sliceIntoBands(items, totalHeight)
    return { bands, totalHeight }
  }, [
    layoutMode,
    data,
    screenWidth,
    numColumns,
    spacing,
    aspectRatioFallbacks,
    getExtraHeight,
    expandedItemIds,
    getExpandedHeight,
    measurementGeneration
  ])

  // Helper to find an item's top position in layout data
  const findItemTop = useCallback((itemId: string): number | null => {
    if (columnLayoutData != null) {
      for (const band of columnLayoutData.bands) {
        for (const item of band.items) {
          if (item.id === itemId) return item.top
        }
      }
    }
    if (rowLayoutData != null) {
      for (const row of rowLayoutData.rows) {
        for (const item of row.items) {
          if (item.id === itemId) return row.top + item.top
        }
      }
    }
    return null
  }, [columnLayoutData, rowLayoutData])

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    scrollToItem (id: string, options?: { animated?: boolean, viewOffset?: number }) {
      const top = findItemTop(id)
      if (top == null) return
      const offset = top - (options?.viewOffset ?? 0)
      listRef.current?.scrollToOffset({
        offset: Math.max(0, offset),
        animated: options?.animated !== false
      })
    },
    scrollToOffset (offset: number, options?: { animated?: boolean }) {
      listRef.current?.scrollToOffset({
        offset,
        animated: options?.animated !== false
      })
    },
    notifyHeightChanged (id: string, newHeight: number) {
      measuredHeightsRef.current.set(id, newHeight)
      setMeasurementGeneration((g) => g + 1)
    }
  }), [findItemTop])

  // Toggle detection and auto-scroll
  useEffect(() => {
    const prevIds = prevExpandedIdsRef.current
    const currentIds = expandedItemIds ?? []
    prevExpandedIdsRef.current = currentIds

    const { added, removed } = diffExpandedIds(prevIds, currentIds)

    // Clear measured heights for collapsed items
    for (const id of removed) {
      measuredHeightsRef.current.delete(id)
    }

    if (added.length === 0 && removed.length === 0) return

    // Fire onExpandedItemLayout callback for each toggled item
    if (onExpandedItemLayout != null && columnLayoutData != null) {
      const allItems = columnLayoutData.bands.flatMap((band) => band.items)
      for (const id of [...added, ...removed]) {
        const layoutItem = allItems.find((item) => item.id === id)
        if (layoutItem != null) {
          onExpandedItemLayout({
            item: layoutItem,
            index: layoutItem.masonryIndex,
            dimensions: { width: layoutItem.width, height: layoutItem.height, left: layoutItem.left, top: layoutItem.top },
            isExpanded: added.includes(id)
          })
        }
      }
    }

    // Auto-scroll to the target item
    if (autoScrollOnExpand == null || autoScrollOnExpand === false) return

    const config = autoScrollOnExpand === true
      ? { animated: true, viewOffset: 0 }
      : { animated: autoScrollOnExpand.animated !== false, viewOffset: autoScrollOnExpand.viewOffset ?? 0 }

    const targetId = selectScrollTarget(added, removed, data)
    if (targetId == null) return

    const top = findItemTop(targetId)
    if (top == null) return

    const offset = Math.max(0, top - config.viewOffset)
    listRef.current?.scrollToOffset({
      offset,
      animated: config.animated
    })
  }, [expandedItemIds, columnLayoutData, rowLayoutData, autoScrollOnExpand, onExpandedItemLayout, data, findItemTop])

  // Key extractor with default
  const getKey = useCallback((item: MasonryItem, index: number) => {
    if (keyExtractor != null) return keyExtractor(item, index)
    const itemId = item.id?.toString()
    return (itemId !== undefined && itemId !== '') ? itemId : index.toString()
  }, [keyExtractor])

  // Render a single row (row mode)
  const renderRow = useCallback(
    ({ item: row }: { item: MasonryRowData }) => {
      if (row?.items == null || row.items.length === 0) return null

      const hasExpandedItem = row.items.some((p) => p.isExpanded)
      const rowHeight = hasExpandedItem
        ? (measuredHeightsRef.current.get(row.items[0].id) ?? row.height)
        : row.height

      return (
        <View style={[styles.rowContainer, { height: rowHeight, marginBottom: spacing }]}>
          {row.items.map((photo) => {
            const info = {
              item: photo,
              index: photo.masonryIndex,
              dimensions: { width: photo.width, height: photo.height, left: photo.left, top: photo.top },
              extraHeight: photo.extraHeight,
              isExpanded: photo.isExpanded
            }
            onItemLayout?.(info)

            if (photo.isExpanded) {
              return (
                <View
                  key={getKey(photo, photo.masonryIndex)}
                  style={[styles.itemContainer, { top: photo.top, left: photo.left, width: photo.width }]}
                  onLayout={(e: LayoutChangeEvent) => {
                    batchHeightUpdate(photo.id, e.nativeEvent.layout.height)
                  }}
                >
                  {renderItem(info)}
                </View>
              )
            }

            return (
              <View
                key={getKey(photo, photo.masonryIndex)}
                style={[styles.itemContainer, { top: photo.top, left: photo.left, width: photo.width, height: photo.height }]}
              >
                {renderItem(info)}
              </View>
            )
          })}
        </View>
      )
    },
    [renderItem, spacing, getKey, onItemLayout, batchHeightUpdate]
  )

  // Render a single band (column mode)
  const renderBand = useCallback(
    ({ item: band }: { item: MasonryBandData }) => {
      if (band?.items == null || band.items.length === 0) return null

      const hasExpandedItem = band.items.some((p) => p.isExpanded)
      const bandHeight = hasExpandedItem
        ? (measuredHeightsRef.current.get(band.items[0].id) ?? band.height)
        : band.height

      return (
        <View style={[styles.rowContainer, { height: bandHeight }]}>
          {band.items.map((photo) => {
            const info = {
              item: photo,
              index: photo.masonryIndex,
              dimensions: { width: photo.width, height: photo.height, left: photo.left, top: photo.top - band.top },
              extraHeight: photo.extraHeight,
              columnIndex: photo.columnIndex >= 0 ? photo.columnIndex : undefined,
              isExpanded: photo.isExpanded
            }
            onItemLayout?.(info)

            if (photo.isExpanded) {
              return (
                <View
                  key={getKey(photo, photo.masonryIndex)}
                  style={[styles.itemContainer, { top: photo.top - band.top, left: photo.left, width: photo.width }]}
                  onLayout={(e: LayoutChangeEvent) => {
                    batchHeightUpdate(photo.id, e.nativeEvent.layout.height)
                  }}
                >
                  {renderItem(info)}
                </View>
              )
            }

            return (
              <View
                key={getKey(photo, photo.masonryIndex)}
                style={[styles.itemContainer, { top: photo.top - band.top, left: photo.left, width: photo.width, height: photo.height }]}
              >
                {renderItem(info)}
              </View>
            )
          })}
        </View>
      )
    },
    [renderItem, getKey, onItemLayout, batchHeightUpdate]
  )

  // Row key extractor
  const rowKeyExtractor = useCallback((row: MasonryRowData) => {
    return `row-${row.rowIndex}`
  }, [])

  // Band key extractor
  const bandKeyExtractor = useCallback((band: MasonryBandData) => {
    return `band-${band.bandIndex}`
  }, [])

  // Container styles
  const containerStyle: ViewStyle = {
    flex: 1,
    ...(style as ViewStyle)
  }

  const contentStyle: ViewStyle = {
    paddingBottom: 100,
    ...(contentContainerStyle as ViewStyle)
  }

  if (layoutMode === 'column' && columnLayoutData != null) {
    const { bands } = columnLayoutData

    const getBandHeight = (band: MasonryBandData): number => {
      const expandedItem = band.items.find((i) => i.isExpanded)
      if (expandedItem != null) {
        return measuredHeightsRef.current.get(expandedItem.id) ?? band.height
      }
      return band.height
    }

    const getColumnItemLayout = (_itemData: MasonryBandData[] | null | undefined, index: number): { length: number, offset: number, index: number } => {
      let offset = 0
      for (let i = 0; i < index; i++) {
        const b = bands[i]
        offset += b != null ? getBandHeight(b) : 300
      }
      const band = bands[index]
      return {
        length: band != null ? getBandHeight(band) : 300,
        offset,
        index
      }
    }

    return (
      <VirtualizedList
        ref={listRef}
        {...virtualizedListProps}
        data={bands as any}
        horizontal={false}
        renderItem={renderBand as any}
        keyExtractor={bandKeyExtractor as any}
        getItemCount={(listData) => listData?.length ?? 0}
        getItem={(listData, index) => listData?.[index]}
        getItemLayout={getColumnItemLayout as any}
        style={containerStyle}
        contentContainerStyle={contentStyle}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
      />
    )
  }

  // Row mode (default)
  const getRowHeight = (row: MasonryRowData): number => {
    const expandedItem = row.items.find((i) => i.isExpanded)
    if (expandedItem != null) {
      return measuredHeightsRef.current.get(expandedItem.id) ?? row.height
    }
    return row.height
  }

  const getItemLayout = (_itemData: MasonryRowData[] | null | undefined, index: number): { length: number, offset: number, index: number } => {
    let offset = 0
    const rows = rowLayoutData?.rows ?? []
    for (let i = 0; i < index; i++) {
      const row = rows[i]
      offset += (row != null ? getRowHeight(row) : baseHeight) + spacing
    }
    const row = rows[index]
    return {
      length: row != null ? getRowHeight(row) + spacing : baseHeight + spacing,
      offset,
      index
    }
  }

  return (
    <VirtualizedList
      ref={listRef}
      {...virtualizedListProps}
      data={rowLayoutData?.rows ?? []}
      horizontal={false}
      renderItem={renderRow}
      keyExtractor={rowKeyExtractor}
      getItemCount={(listData) => listData?.length ?? 0}
      getItem={(listData, index) => listData?.[index]}
      getItemLayout={getItemLayout}
      style={containerStyle}
      contentContainerStyle={contentStyle}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10
      }}
    />
  )
})

export default ExpoMasonryLayout

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative'
  },
  itemContainer: {
    position: 'absolute'
  }
})
