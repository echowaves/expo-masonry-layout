import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
  VirtualizedList,
} from 'react-native';
import { ExpoMasonryLayoutProps, MasonryItem, MasonryRowData } from './types';
import { calculateRowMasonryLayout } from './utils';

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
export const ExpoMasonryLayout: React.FC<ExpoMasonryLayoutProps> = ({
  data,
  renderItem,
  spacing = 6,
  maxItemsPerRow = 6,
  baseHeight = 100,
  aspectRatioFallbacks,
  keyExtractor,
  style,
  contentContainerStyle,
  ...virtualizedListProps
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Memoize layout calculation to avoid recalculation on every render
  const layoutData = useMemo(() => {
    return calculateRowMasonryLayout(
      data,
      screenWidth,
      spacing,
      baseHeight,
      maxItemsPerRow,
      aspectRatioFallbacks
    );
  }, [
    data,
    screenWidth,
    spacing,
    baseHeight,
    maxItemsPerRow,
    aspectRatioFallbacks,
  ]);

  // Default key extractor
  const defaultKeyExtractor = useCallback(
    (item: MasonryItem, index: number) => {
      return item.id?.toString() || index.toString();
    },
    []
  );

  const getKeyExtractor = keyExtractor || defaultKeyExtractor;

  // Render a single row containing multiple masonry items
  const renderRow = useCallback(
    ({ item: row }: { item: MasonryRowData }) => {
      if (!row || !row.items || row.items.length === 0) {
        return null;
      }

      return (
        <View
          style={[
            styles.rowContainer,
            {
              height: row.height,
              marginBottom: spacing,
            },
          ]}
        >
          {row.items.map(photo => (
            <View
              key={getKeyExtractor(photo, photo.masonryIndex)}
              style={[
                styles.itemContainer,
                {
                  top: photo.top,
                  left: photo.left,
                  width: photo.width,
                  height: photo.height,
                },
              ]}
            >
              {renderItem({
                item: photo,
                index: photo.masonryIndex,
                dimensions: {
                  width: photo.width,
                  height: photo.height,
                  left: photo.left,
                  top: photo.top,
                },
              })}
            </View>
          ))}
        </View>
      );
    },
    [renderItem, spacing, getKeyExtractor]
  );

  // Row key extractor
  const rowKeyExtractor = useCallback((row: MasonryRowData) => {
    return `row-${row.rowIndex}`;
  }, []);

  // Get item layout for VirtualizedList optimization
  const getItemLayout = useCallback(
    (itemData: MasonryRowData[] | null | undefined, index: number) => {
      if (!itemData || !itemData[index]) {
        return {
          length: baseHeight + spacing,
          offset: index * (baseHeight + spacing),
          index,
        };
      }

      const row = itemData[index];
      return {
        length: row.height + spacing,
        offset: row.top || 0,
        index,
      };
    },
    [baseHeight, spacing]
  );

  // Container styles
  const containerStyle: ViewStyle = {
    flex: 1,
    ...(style as ViewStyle),
  };

  const contentStyle: ViewStyle = {
    paddingBottom: 100,
    ...(contentContainerStyle as ViewStyle),
  };

  return (
    <VirtualizedList
      {...virtualizedListProps}
      data={layoutData.rows}
      horizontal={false}
      renderItem={renderRow}
      keyExtractor={rowKeyExtractor}
      getItemCount={listData => listData?.length || 0}
      getItem={(listData, index) => listData?.[index]}
      getItemLayout={getItemLayout}
      style={containerStyle}
      contentContainerStyle={contentStyle}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
    />
  );
};

export default ExpoMasonryLayout;

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative',
  },
  itemContainer: {
    position: 'absolute',
  },
});
