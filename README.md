# expo-masonry-layout

<p align="center">
  <img src="./assets/simulator_screenshot_B5DA## 🖼️ Using with Expo Cached Image

For better performance with remote images, we recommend using [`expo-cached-image`](https://github.com/kanzitelli/expo-cached-image) alongside the masonry layout:8-A4BA-4B8A-8917-45AE7F50F97A.png" alt="Expo Masonry Layout Demo" width="300" />

</p>

<p align="center">
  <strong>A high-performance masonry layout component for React Native and Expo applications</strong>
</p>

<p align="center">
  <em>✨ Used in production by <a href="https://github.com/echowaves/WiSaw">WiSaw</a> - a location-based photo sharing app</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/expo-masonry-layout">
    <img src="https://img.shields.io/npm/v/expo-masonry-layout.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/expo-masonry-layout">
    <img src="https://img.shields.io/npm/dm/expo-masonry-layout.svg" alt="npm downloads" />
  </a>
  <a href="https://github.com/echowaves/expo-masonry-layout/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
  </a>
</p>

## ✨ Features

- 🚀 **High Performance**: Uses VirtualizedList for optimal performance with large datasets
- 📱 **Responsive**: Automatically adapts to screen size and orientation changes
- 🎨 **Flexible**: Supports custom aspect ratios and layout configurations
- 🔄 **Interactive**: Built-in pull-to-refresh and infinite scroll support
- 📐 **Smart Layout**: Intelligent row-based masonry with justified alignment
- 🎯 **TypeScript**: Full TypeScript support with comprehensive types
- ⚡ **Optimized**: Minimal re-renders with memoized calculations

## 🌟 Real-world Usage

This component is actively used in production by:

- **[WiSaw](https://github.com/echowaves/WiSaw)** - A location-based photo sharing mobile app that displays thousands of user-generated photos in a beautiful masonry layout. WiSaw demonstrates the component's ability to handle large datasets with smooth scrolling and optimal performance.

The screenshot above is taken directly from the WiSaw app, showcasing real-world usage with actual user photos.

## 🚀 Installation

```bash
npm install expo-masonry-layout
# or
yarn add expo-masonry-layout
```

## 📖 Quick Start

````tsx
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

## �️ Using with Expo Cached Image

For better performance with remote images, we recommend using `expo-cached-image` alongside the masonry layout:

```bash
npm install expo-cached-image
# or
yarn add expo-cached-image
```

Here's how to integrate it:

```tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import ExpoMasonryLayout from 'expo-masonry-layout';
import { CachedImage } from 'expo-cached-image';

const CachedMasonryGrid = () => {
  const data = [
    { id: '1', uri: 'https://example.com/image1.jpg', width: 300, height: 400 },
    { id: '2', uri: 'https://example.com/image2.jpg', width: 400, height: 300 },
    { id: '3', uri: 'https://example.com/image3.jpg', width: 300, height: 300 },
    // ... more items
  ];

  const renderItem = ({ item, dimensions }) => (
    <View style={{ width: dimensions.width, height: dimensions.height }}>
      <CachedImage
        source={{ uri: item.uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        cacheKey={`masonry-${item.id}`} // Unique cache key
        placeholderContent={
          <View
            style={{
              flex: 1,
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          />
        }
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

### Benefits of Using Expo Cached Image:

- **Automatic Caching**: Images are cached locally after first load
- **Placeholder Support**: Shows placeholder while loading
- **Better Performance**: Reduces network requests for repeated views
- **Memory Management**: Efficient image memory handling
- **Progressive Loading**: Smooth loading experience

### Performance Tips with Cached Images:

1. **Use Unique Cache Keys**: Ensure each image has a unique `cacheKey` prop
2. **Optimize Image Sizes**: Use appropriately sized images for your layout
3. **Implement Placeholders**: Provide placeholder content for better UX
4. **Clear Cache When Needed**: Implement cache clearing for updated content

```tsx
// Example with cache management
import { CachedImage } from 'expo-cached-image';

const clearImageCache = async () => {
  await CachedImage.clearCache();
};

// Clear cache for specific images
const clearSpecificCache = async (imageId) => {
  await CachedImage.clearCache(`masonry-${imageId}`);
};
```

## �🔧 Advanced Usage

Here's a comprehensive example inspired by the WiSaw app implementation:

```tsx
import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
import ExpoMasonryLayout, { MasonryRenderItemInfo } from 'expo-masonry-layout';

// Example data structure similar to WiSaw's photo feed
const PhotoMasonryGrid = () => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Photo item renderer similar to WiSaw's implementation
  const renderPhotoItem = useCallback(
    ({ item, dimensions }: MasonryRenderItemInfo) => (
      <TouchableOpacity
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => handlePhotoPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: '100%',
            height: '85%',
          }}
          resizeMode="cover"
          loadingIndicatorSource={require('./placeholder.png')}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600',
            }}
            numberOfLines={1}
          >
            📍 {item.location}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 10,
              marginTop: 2,
            }}
          >
            ❤️ {item.likes} • 👤 {item.username}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const handlePhotoPress = useCallback(photo => {
    // Navigate to photo detail view (like in WiSaw)
    console.log('Photo pressed:', photo.id);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch fresh photos from your API
      const freshPhotos = await fetchLatestPhotos();
      setPhotos(freshPhotos);
    } catch (error) {
      console.error('Error refreshing photos:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Load more photos for infinite scroll
      const morePhotos = await fetchMorePhotos(photos.length);
      setPhotos(prevPhotos => [...prevPhotos, ...morePhotos]);
    } catch (error) {
      console.error('Error loading more photos:', error);
    } finally {
      setLoading(false);
    }
  }, [photos.length, loading]);

  return (
    <ExpoMasonryLayout
      data={photos}
      renderItem={renderPhotoItem}
      spacing={8}
      maxItemsPerRow={2} // WiSaw uses 2 columns for optimal photo viewing
      baseHeight={200}
      keyExtractor={item => item.id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      aspectRatioFallbacks={[0.7, 1.0, 1.3, 1.6]} // Common photo ratios
      style={{ backgroundColor: '#f8f9fa' }}
      contentContainerStyle={{ padding: 8 }}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={15}
    />
  );
};
````

## 📋 API Reference

### Props

| Prop                           | Type                                            | Default                                    | Description                         |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| `data`                         | `MasonryItem[]`                                 | **required**                               | Array of items to display           |
| `renderItem`                   | `(info: MasonryRenderItemInfo) => ReactElement` | **required**                               | Function to render each item        |
| `spacing`                      | `number`                                        | `6`                                        | Space between items in pixels       |
| `maxItemsPerRow`               | `number`                                        | `6`                                        | Maximum number of items per row     |
| `baseHeight`                   | `number`                                        | `100`                                      | Base height for layout calculations |
| `aspectRatioFallbacks`         | `number[]`                                      | `[0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]` | Fallback aspect ratios              |
| `keyExtractor`                 | `(item: MasonryItem, index: number) => string`  | `(item, index) => item.id \|\| index`      | Extract unique key for each item    |
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

### 🔷 Types

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

## 🎯 Performance Tips

1. **Provide Image Dimensions**: Include `width` and `height` in your data items for optimal layout calculation
2. **Memoize Render Function**: Use `useCallback` for your `renderItem` function
3. **Optimize Images**: Use appropriate image sizes and consider lazy loading
4. **Key Extractor**: Provide a stable `keyExtractor` function
5. **Batch Size**: Adjust `maxToRenderPerBatch` based on your item complexity

## 🧮 Layout Algorithm

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

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/echowaves/expo-masonry-layout/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/echowaves/expo-masonry-layout/discussions)
- 📱 **See it in action**: Check out [WiSaw](https://github.com/echowaves/WiSaw) for a real-world implementation
- 📧 **Email**: [Contact Echowaves](mailto:support@echowaves.com)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/echowaves">Echowaves Corp.</a><br/>
  <em>Powering beautiful photo experiences in <a href="https://github.com/echowaves/WiSaw">WiSaw</a> and beyond</em>
</p>
