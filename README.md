# expo-masonry-layout

A high-performance masonry layout component for React Native and Expo applications.

## Features

- 🚀 **High Performance**: Uses VirtualizedList for optimal performance with large datasets
- 📱 **Responsive**: Automatically adapts to screen size and orientation changes
- 🎨 **Flexible**: Supports custom aspect ratios and layout configurations
- 🔄 **Interactive**: Built-in pull-to-refresh and infinite scroll support
- 📐 **Smart Layout**: Intelligent row-based masonry with justified alignment
- 🎯 **TypeScript**: Full TypeScript support with comprehensive types
- ⚡ **Optimized**: Minimal re-renders with memoized calculations

## Installation

```bash
npm install expo-masonry-layout
# or
yarn add expo-masonry-layout
```

## Basic Usage

```tsx
import React from 'react';
import { View, Image, Text } from 'react-native';
import ExpoMasonryLayout from 'expo-masonry-layout';

const MyMasonryGrid = () => {
  const data = [
    { id: '1', uri: 'https://example.com/image1.jpg', width: 300, height: 400 },
    { id: '2', uri: 'https://example.com/image2.jpg', width: 400, height: 300 },
    { id: '3', uri: 'https://example.com/image3.jpg', width: 300, height: 300 },
    // ... more items
  ];

  const renderItem = ({ item, dimensions }) => (
    <View style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        source={{ uri: item.uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <ExpoMasonryLayout
      data={data}
      renderItem={renderItem}
      spacing={6}
      keyExtractor={item => item.id}
    />
  );
};
```

## Advanced Usage

```tsx
import React, { useState, useCallback } from 'react';
import ExpoMasonryLayout, { MasonryRenderItemInfo } from 'expo-masonry-layout';

const AdvancedMasonryGrid = () => {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const renderItem = useCallback(
    ({ item, dimensions }: MasonryRenderItemInfo) => (
      <TouchableOpacity
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: 8,
          overflow: 'hidden',
        }}
        onPress={() => handleItemPress(item)}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch new data
    const newData = await fetchData();
    setData(newData);
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    // Load more data
    const moreData = await fetchMoreData();
    setData(prevData => [...prevData, ...moreData]);
  }, []);

  return (
    <ExpoMasonryLayout
      data={data}
      renderItem={renderItem}
      spacing={8}
      maxItemsPerRow={4}
      baseHeight={120}
      keyExtractor={item => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      aspectRatioFallbacks={[0.8, 1.0, 1.2, 1.5]}
      style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};
```

## API Reference

### Props

| Prop                           | Type                                            | Default                                    | Description                         |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------ | ----------------------------------- | ------ | -------------------------------- |
| `data`                         | `MasonryItem[]`                                 | **required**                               | Array of items to display           |
| `renderItem`                   | `(info: MasonryRenderItemInfo) => ReactElement` | **required**                               | Function to render each item        |
| `spacing`                      | `number`                                        | `6`                                        | Space between items in pixels       |
| `maxItemsPerRow`               | `number`                                        | `6`                                        | Maximum number of items per row     |
| `baseHeight`                   | `number`                                        | `100`                                      | Base height for layout calculations |
| `aspectRatioFallbacks`         | `number[]`                                      | `[0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]` | Fallback aspect ratios              |
| `keyExtractor`                 | `(item: MasonryItem, index: number) => string`  | `(item, index) => item.id \\               | \\                                  | index` | Extract unique key for each item |
| `onEndReached`                 | `() => void`                                    | `undefined`                                | Called when scrolling near end      |
| `onEndReachedThreshold`        | `number`                                        | `0.1`                                      | Threshold for `onEndReached`        |
| `refreshing`                   | `boolean`                                       | `false`                                    | Whether list is refreshing          |
| `onRefresh`                    | `() => void`                                    | `undefined`                                | Called on pull-to-refresh           |
| `initialNumToRender`           | `number`                                        | `10`                                       | Initial number of items to render   |
| `maxToRenderPerBatch`          | `number`                                        | `15`                                       | Max items to render per batch       |
| `windowSize`                   | `number`                                        | `21`                                       | Window size for virtualization      |
| `style`                        | `ViewStyle`                                     | `undefined`                                | Style for container                 |
| `contentContainerStyle`        | `ViewStyle`                                     | `undefined`                                | Style for scroll content            |
| `showsVerticalScrollIndicator` | `boolean`                                       | `false`                                    | Show scroll indicator               |

### Types

#### MasonryItem

```tsx
interface MasonryItem {
  id: string;
  width?: number;
  height?: number;
  [key: string]: any;
}
```

#### MasonryRenderItemInfo

```tsx
interface MasonryRenderItemInfo {
  item: MasonryItem;
  index: number;
  dimensions: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
}
```

## Performance Tips

1. **Provide Image Dimensions**: Include `width` and `height` in your data items for optimal layout calculation
2. **Memoize Render Function**: Use `useCallback` for your `renderItem` function
3. **Optimize Images**: Use appropriate image sizes and consider lazy loading
4. **Key Extractor**: Provide a stable `keyExtractor` function
5. **Batch Size**: Adjust `maxToRenderPerBatch` based on your item complexity

## Layout Algorithm

The component uses a sophisticated row-based masonry algorithm:

1. **Row Filling**: Items are added to rows based on available width
2. **Height Normalization**: All items in a row are scaled to the same height
3. **Width Justification**: The entire row is scaled to fill the available width
4. **Vertical Positioning**: Items are vertically centered within their row

This approach ensures:

- Consistent row heights for smooth scrolling
- Optimal use of screen space
- Predictable layout behavior
- Excellent performance with virtualization

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Support

If you encounter any issues or have questions, please file an issue on our GitHub repository.
