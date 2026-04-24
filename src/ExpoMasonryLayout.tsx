import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { StyleSheet, useWindowDimensions, View, ViewStyle, VirtualizedList } from 'react-native'
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

  const numColumns = useMemo(() => {
    if (layoutMode !== 'column') return 0
    return resolveColumnCount(columns, screenWidth)
  }, [layoutMode, columns, screenWidth])

  const hasExpandedItems = expandedItemIds != null && expandedItemIds.length > 0
  if (layoutMode === 'column' && hasExpandedItems && getExpandedHeight == null) {
    console.warn('ExpoMasonryLayout: getExpandedHeight is required when expandedItemIds is non-empty in column mode')
  }

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
      getExtraHeight
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
    getExtraHeight
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
      getExpandedHeight
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
    getExpandedHeight
  ])

  // Helper to find an item's top position in column layout data
  const findItemTop = useCallback((itemId: string): number | null => {
    if (columnLayoutData == null) return null
    for (const band of columnLayoutData.bands) {
      for (const item of band.items) {
        if (item.id === itemId) return item.top
      }
    }
    return null
  }, [columnLayoutData])

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    scrollToItem(id: string, options?: { animated?: boolean, viewOffset?: number }) {
      const top = findItemTop(id)
      if (top == null) return
      const offset = top - (options?.viewOffset ?? 0)
      listRef.current?.scrollToOffset({
        offset: Math.max(0, offset),
        animated: options?.animated !== false
      })
    },
    scrollToOffset(offset: number, options?: { animated?: boolean }) {
      listRef.current?.scrollToOffset({
        offset,
        animated: options?.animated !== false
      })
    }
  }), [findItemTop])

  // Toggle detection and auto-scroll
  useEffect(() => {
    if (layoutMode !== 'column') {
      prevExpandedIdsRef.current = expandedItemIds ?? []
      return
    }

    const prevIds = prevExpandedIdsRef.current
    const currentIds = expandedItemIds ?? []
    prevExpandedIdsRef.current = currentIds

    const { added, removed } = diffExpandedIds(prevIds, currentIds)

    if (added.length === 0 && removed.length === 0) return
    if (columnLayoutData == null) return

    // Fire onExpandedItemLayout callback for each toggled item
    if (onExpandedItemLayout != null) {
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
  }, [layoutMode, expandedItemIds, columnLayoutData, autoScrollOnExpand, onExpandedItemLayout, data, findItemTop])

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

      return (
        <View style={[styles.rowContainer, { height: row.height, marginBottom: spacing }]}>
          {row.items.map((photo) => {
            const info = {
              item: photo,
              index: photo.masonryIndex,
              dimensions: { width: photo.width, height: photo.height, left: photo.left, top: photo.top },
              extraHeight: photo.extraHeight,
              isExpanded: false
            }
            onItemLayout?.(info)
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
    [renderItem, spacing, getKey, onItemLayout]
  )

  // Render a single band (column mode)
  const renderBand = useCallback(
    ({ item: band }: { item: MasonryBandData }) => {
      if (band?.items == null || band.items.length === 0) return null

      return (
        <View style={[styles.rowContainer, { height: band.height }]}>
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
    [renderItem, getKey, onItemLayout]
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

    const getColumnItemLayout = (_itemData: MasonryBandData[] | null | undefined, index: number): { length: number, offset: number, index: number } => {
      const band = bands[index]
      return {
        length: band != null ? band.height : 300,
        offset: band != null ? band.top : index * 300,
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
  const getItemLayout = (_itemData: MasonryRowData[] | null | undefined, index: number): { length: number, offset: number, index: number } => {
    const row = rowLayoutData?.rows[index]
    return {
      length: row != null ? row.height + spacing : baseHeight + spacing,
      offset: row != null ? (row.top ?? 0) : index * (baseHeight + spacing),
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
