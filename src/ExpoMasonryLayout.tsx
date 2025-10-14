import React, { useCallback, useMemo } from 'react'
import { StyleSheet, useWindowDimensions, View, ViewStyle, VirtualizedList } from 'react-native'
import { ExpoMasonryLayoutProps, MasonryItem, MasonryRowData } from './types'
import { calculateRowMasonryLayout } from './utils'

/**
 * High-performance masonry layout component for React Native and Expo
 *
 * Features:
 * - Row-based masonry layout optimized for vertical scrolling
 * - VirtualizedList for performance with large datasets
 * - Automatic aspect ratio handling with fallbacks
 * - Pull-to-refresh and infinite scroll support
 * - TypeScript support with comprehensive prop types
 */
export function ExpoMasonryLayout (props: ExpoMasonryLayoutProps): React.JSX.Element {
  const {
    data,
    renderItem,
    spacing = 6,
    maxItemsPerRow = 6,
    baseHeight = 100,
    aspectRatioFallbacks,
    preserveItemDimensions = false,
    getItemDimensions,
    keyExtractor,
    onItemLayout,
    style,
    contentContainerStyle,
    ...virtualizedListProps
  } = props
  const { width: screenWidth } = useWindowDimensions()

  // Memoize layout calculation to avoid recalculation on every render
  const layoutData = useMemo(() => {
    return calculateRowMasonryLayout(
      data,
      screenWidth,
      spacing,
      baseHeight,
      maxItemsPerRow,
      aspectRatioFallbacks,
      preserveItemDimensions,
      getItemDimensions
    )
  }, [
    data,
    screenWidth,
    spacing,
    baseHeight,
    maxItemsPerRow,
    aspectRatioFallbacks,
    preserveItemDimensions,
    getItemDimensions
  ])

  // Key extractor with default
  const getKey = useCallback((item: MasonryItem, index: number) => {
    if (keyExtractor != null) return keyExtractor(item, index)
    const itemId = item.id?.toString()
    return (itemId !== undefined && itemId !== '') ? itemId : index.toString()
  }, [keyExtractor])

  // Render a single row
  const renderRow = useCallback(
    ({ item: row }: { item: MasonryRowData }) => {
      if (row?.items == null || row.items.length === 0) return null

      return (
        <View style={[styles.rowContainer, { height: row.height, marginBottom: spacing }]}>
          {row.items.map((photo) => {
            const info = {
              item: photo,
              index: photo.masonryIndex,
              dimensions: { width: photo.width, height: photo.height, left: photo.left, top: photo.top }
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

  // Row key extractor
  const rowKeyExtractor = useCallback((row: MasonryRowData) => {
    return `row-${row.rowIndex}`
  }, [])

  // Get item layout for VirtualizedList
  const getItemLayout = useCallback(
    (itemData: MasonryRowData[] | null | undefined, index: number) => {
      const row = itemData?.[index]
      return {
        length: row != null ? row.height + spacing : baseHeight + spacing,
        offset: row != null ? (row.top ?? 0) : index * (baseHeight + spacing),
        index
      }
    },
    [baseHeight, spacing]
  )

  // Container styles
  const containerStyle: ViewStyle = {
    flex: 1,
    ...(style as ViewStyle)
  }

  const contentStyle: ViewStyle = {
    paddingBottom: 100,
    ...(contentContainerStyle as ViewStyle)
  }

  return (
    <VirtualizedList
      {...virtualizedListProps}
      data={layoutData.rows}
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
}

export default ExpoMasonryLayout

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative'
  },
  itemContainer: {
    position: 'absolute'
  }
})
