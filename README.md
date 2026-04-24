# expo-masonry-layout

<p align="center">
  <img src="./assets/simulator_screenshot_B5DA2B98-A4BA-4B8A-8917-45AE7F50F97A.png" alt="Expo Masonry Layout Demo" width="300" />
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
- 📐 **Dual Layout Modes**: Row-based masonry with justified alignment and column-based masonry with shortest-column placement
- 📊 **Responsive Columns**: Column mode supports responsive breakpoints for adaptive column counts
- 📝 **Extra Height**: `getExtraHeight` callback for adding dynamic per-item content (captions, badges, buttons) below images
- 🔍 **Inline Expand**: Expand items to full-width detail view inline within the column layout, with multi-expand support
- � **Shadow-Friendly**: Item containers don't clip overflow, so shadows, badges, and decorations render correctly
- �🎯 **TypeScript**: Full TypeScript support with comprehensive types
- ⚡ **Optimized**: Minimal re-renders with memoized calculations

## 🌟 Real-world Usage

This component is actively used in production by:

- **[WiSaw](https://github.com/echowaves/WiSaw)** - A location-based photo sharing mobile app that displays thousands of user-generated photos in a beautiful masonry layout. WiSaw demonstrates the component's ability to handle large datasets with smooth scrolling and optimal performance.

The screenshot above is taken directly from the WiSaw app, showcasing real-world usage with actual user photos.

## 🚀 Installation

````bash
npm install expo-masonry-layout
# or
yarn add expo-masonry-layout


## 📖 Quick Start

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
````

## 🖼️ Using with Expo Cached Image

For better performance with remote images, we recommend using [`expo-cached-image`](https://github.com/kanzitelli/expo-cached-image) alongside the masonry layout:

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
    { id: '3', uri: 'https://example.com/image3.jpg', width: 300, height: 300 }
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
      keyExtractor={(item) => item.id}
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

## � Column Layout Mode

Column-based masonry places items into columns of equal width, filling the shortest column first — the standard Pinterest-style layout:

```tsx
import ExpoMasonryLayout from 'expo-masonry-layout';

const ColumnMasonryGrid = () => (
  <ExpoMasonryLayout
    data={data}
    renderItem={renderItem}
    layoutMode="column"
    columns={3}
    spacing={8}
  />
);
```

### Responsive Column Count

Use breakpoints to adapt column count to screen width. Breakpoints are width ceilings evaluated from smallest up:

```tsx
import ExpoMasonryLayout, { ColumnsConfig } from 'expo-masonry-layout';

// 1 column on phones (≤400), 2 on tablets (≤768), 3 on wider screens
const columns: ColumnsConfig = {
  default: 3,
  768: 2,
  400: 1,
};

const ResponsiveGrid = () => (
  <ExpoMasonryLayout
    data={data}
    renderItem={renderItem}
    layoutMode="column"
    columns={columns}
    spacing={8}
  />
);
```

## 📝 Extra Height (getExtraHeight)

Add dynamic content below each item's image area using the `getExtraHeight` callback. Works in both row and column modes:

```tsx
import ExpoMasonryLayout, { MasonryItem, MasonryRenderItemInfo } from 'expo-masonry-layout';

// Calculate extra height for caption text
const getExtraHeight = (item: MasonryItem, computedWidth: number): number => {
  if (!item.caption) return 0;
  const charsPerLine = Math.floor(computedWidth / 8);
  const numLines = Math.ceil((item.caption as string).length / charsPerLine);
  return numLines * 18 + 16; // lineHeight * lines + padding
};

const renderItem = ({ item, dimensions, extraHeight }: MasonryRenderItemInfo) => {
  const imageHeight = dimensions.height - extraHeight;
  return (
    <View style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: dimensions.width, height: imageHeight }}
        resizeMode="cover"
      />
      {item.caption ? (
        <Text style={{ padding: 8 }}>{item.caption as string}</Text>
      ) : null}
    </View>
  );
};

const CaptionGrid = () => (
  <ExpoMasonryLayout
    data={data}
    renderItem={renderItem}
    layoutMode="column"
    columns={2}
    spacing={8}
    getExtraHeight={getExtraHeight}
  />
);
```

**How it works:**
- In **row mode**: row height becomes `max(imageHeight + extraHeight)` across all items in the row. Item widths are computed first (two-pass), then `getExtraHeight` is called with the final width.
- In **column mode**: each item's total height is `scaledImageHeight + extraHeight`, stacked independently per column. Width is known upfront (`screenWidth / numColumns`).
- `extraHeight` is passed in `MasonryRenderItemInfo` so your `renderItem` knows the image/extra split.

## 🔍 Inline Expand

Expand items to a full-width detail view inline within the column layout. Multiple items can be expanded simultaneously — the layout recalculates on each expand/collapse:

```tsx
import React, { useState, useCallback } from 'react';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import ExpoMasonryLayout, { MasonryItem, MasonryRenderItemInfo } from 'expo-masonry-layout';

const getExpandedHeight = (item: MasonryItem, fullWidth: number): number => {
  const imageHeight = Math.floor(fullWidth / ((item.width ?? 300) / (item.height ?? 300)));
  return imageHeight + 200; // image + details area
};

const InlineExpandGrid = () => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const renderItem = useCallback(
    ({ item, dimensions, isExpanded }: MasonryRenderItemInfo) => {
      if (isExpanded) {
        const imageH = Math.floor(
          dimensions.width / ((item.width ?? 300) / (item.height ?? 300))
        );
        return (
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: dimensions.width, height: imageH }}
            />
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 18 }}>{item.title}</Text>
              <Text>{item.description}</Text>
            </View>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: dimensions.width, height: dimensions.height }}
          />
        </TouchableOpacity>
      );
    },
    [toggleExpand]
  );

  return (
    <ExpoMasonryLayout
      data={data}
      renderItem={renderItem}
      layoutMode="column"
      columns={3}
      spacing={8}
      expandedItemIds={expandedIds}
      getExpandedHeight={getExpandedHeight}
      autoScrollOnExpand
    />
  );
};
```

**How it works:**
- When an expanded item is encountered, all columns flush to the waterline (max column height), the item spans full width, then columns resume below.
- `isExpanded` is passed in `MasonryRenderItemInfo` so `renderItem` can branch between collapsed/expanded views.
- When expanded, `dimensions.width` is the full grid width and `dimensions.height` comes from `getExpandedHeight`.
- `getExtraHeight` is not applied to expanded items — the expanded height replaces the normal layout entirely.
- `autoScrollOnExpand` automatically scrolls to items when they are expanded or collapsed. Pass `{ animated: false }` to disable animation, or `{ viewOffset: 50 }` to add padding above the item.
- Use `onExpandedItemLayout` for custom scroll logic, or a ref with `scrollToItem(id)` for full control.
- Only applies in column mode. In row mode, `expandedItemIds` is ignored.

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
          elevation: 3
        }}
        onPress={() => handlePhotoPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: '100%',
            height: '85%'
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
            padding: 8
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: '600'
            }}
            numberOfLines={1}
          >
            📍 {item.location}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 10,
              marginTop: 2
            }}
          >
            ❤️ {item.likes} • 👤 {item.username}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const handlePhotoPress = useCallback((photo) => {
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
      setPhotos((prevPhotos) => [...prevPhotos, ...morePhotos]);
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
      keyExtractor={(item) => item.id}
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
```

## 🔧 VirtualizedList Pass-Through

The component now supports passing any VirtualizedList prop directly to the underlying implementation. This gives you full control over scrolling behavior, performance tuning, and platform-specific features:

```tsx
import React, { useCallback } from 'react';
import ExpoMasonryLayout from 'expo-masonry-layout';

const AdvancedMasonryGrid = () => {
  const handleScroll = useCallback((event) => {
    console.log('Scroll position:', event.nativeEvent.contentOffset.y);
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    console.log('User started scrolling');
  }, []);

  return (
    <ExpoMasonryLayout
      data={photos}
      renderItem={renderPhotoItem}
      spacing={8}
      maxItemsPerRow={2}

      {/* VirtualizedList props passed through */}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEnabled={true}
      nestedScrollEnabled={true} // Android
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}

      {/* Performance tuning */}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}

      {/* Infinite scroll */}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.2}

      {/* Pull to refresh */}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  );
};
```

## 📋 API Reference

### Props

The component extends React Native's `VirtualizedListProps` and accepts all VirtualizedList properties in addition to the masonry-specific props below:

#### Masonry-Specific Props

| Prop                     | Type                                                                              | Default                                    | Description                                            |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `data`                   | `MasonryItem[]`                                                                   | **required**                               | Array of items to display                              |
| `renderItem`             | `(info: MasonryRenderItemInfo) => ReactElement`                                   | **required**                               | Function to render each item                           |
| `layoutMode`             | `'row' \| 'column'`                                                               | `'row'`                                    | Layout mode: row-based or column-based masonry         |
| `columns`                | `number \| ColumnsConfig`                                                         | `2`                                        | Number of columns or responsive breakpoint config (column mode only) |
| `getExtraHeight`         | `(item: MasonryItem, computedWidth: number) => number`                            | `undefined`                                | Calculate extra height below image area per item       |
| `expandedItemIds`        | `string[]`                                                                        | `undefined`                                | Item IDs currently expanded to full width (column mode only) |
| `getExpandedHeight`      | `(item: MasonryItem, fullWidth: number) => number`                                | `undefined`                                | Calculate total height of an expanded item at full width |
| `spacing`                | `number`                                                                          | `6`                                        | Space between items in pixels                          |
| `maxItemsPerRow`         | `number`                                                                          | `6`                                        | Maximum number of items per row (row mode only)        |
| `baseHeight`             | `number`                                                                          | `100`                                      | Base height for layout calculations (row mode only)    |
| `aspectRatioFallbacks`   | `number[]`                                                                        | `[0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]` | Fallback aspect ratios                                 |
| `preserveItemDimensions` | `boolean`                                                                         | `false`                                    | Whether to respect exact item dimensions when provided |
| `getItemDimensions`      | `(item: MasonryItem, index: number) => { width: number; height: number } \| null` | `undefined`                                | Function to calculate custom dimensions for items      |
| `keyExtractor`           | `(item: MasonryItem, index: number) => string`                                    | `(item, index) => item.id \|\| index`      | Extract unique key for each item                       |
| `onItemLayout`           | `(info: MasonryRenderItemInfo) => void`                                           | `undefined`                                | Callback when an item's layout dimensions are calculated |
| `autoScrollOnExpand`     | `boolean \| { animated?: boolean; viewOffset?: number }`                          | `undefined`                                | Auto-scroll to items when expanded or collapsed (column mode only) |
| `onExpandedItemLayout`   | `(info: { item, index, dimensions, isExpanded }) => void`                         | `undefined`                                | Callback fired for each item whose expand/collapse state changed |

#### VirtualizedList Props

All [VirtualizedList props](https://reactnative.dev/docs/virtualizedlist) are supported and passed through to the underlying implementation, including:

- **Performance**: `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `updateCellsBatchingPeriod`, `removeClippedSubviews`
- **Scrolling**: `onScroll`, `onScrollBeginDrag`, `onScrollEndDrag`, `onMomentumScrollBegin`, `onMomentumScrollEnd`, `scrollEventThrottle`
- **Interaction**: `onEndReached`, `onEndReachedThreshold`, `refreshing`, `onRefresh`, `scrollEnabled`, `bounces`
- **Styling**: `style`, `contentContainerStyle`, `showsVerticalScrollIndicator`
- **Platform**: `nestedScrollEnabled` (Android), `scrollIndicatorInsets` (iOS)

### 🔷 Types

#### MasonryItem

```tsx
interface MasonryItem {
  id: string;
  width?: number;
  height?: number;
  preserveDimensions?: boolean;
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
  extraHeight: number;    // Extra height added below image (0 if no getExtraHeight)
  columnIndex?: number;   // Column index (column mode only, undefined when expanded)
  isExpanded: boolean;    // Whether item is in expanded full-width state
}
```

#### ColumnsConfig

```tsx
type ColumnsConfig = number | { default: number; [breakpoint: number]: number };
```

#### ExpoMasonryLayoutHandle (Ref API)

The component supports `React.forwardRef`. Use a ref to access imperative scroll methods:

```tsx
import { useRef } from 'react';
import ExpoMasonryLayout, { ExpoMasonryLayoutHandle } from 'expo-masonry-layout';

const ref = useRef<ExpoMasonryLayoutHandle>(null);

<ExpoMasonryLayout ref={ref} ... />

// Scroll to a specific item by ID
ref.current?.scrollToItem('item-5', { animated: true, viewOffset: 50 });

// Scroll to a specific offset
ref.current?.scrollToOffset(500, { animated: true });
```

| Method | Signature | Description |
| --- | --- | --- |
| `scrollToItem` | `(id: string, options?: { animated?: boolean; viewOffset?: number }) => void` | Scroll to an item by ID. No-op if ID not found. |
| `scrollToOffset` | `(offset: number, options?: { animated?: boolean }) => void` | Scroll to an absolute offset. Works in both layout modes. |

## 🔄 Custom Dimensions

The library supports multiple ways to override the automatic dimension calculation:

### 1. Per-Item Dimension Preservation

Set `preserveDimensions: true` on individual items to use their exact `width` and `height`:

```tsx
const dataWithExactSizes = [
  {
    id: '1',
    width: 300,
    height: 200,
    preserveDimensions: true, // This item will be exactly 300x200
    imageUrl: 'https://example.com/image1.jpg'
  },
  {
    id: '2',
    width: 400,
    height: 300,
    // No preserveDimensions flag - will be auto-calculated
    imageUrl: 'https://example.com/image2.jpg'
  }
];
```

### 2. Global Dimension Preservation

Use the `preserveItemDimensions` prop to respect exact dimensions for all items that have `width` and `height`:

```tsx
<ExpoMasonryLayout data={data} preserveItemDimensions={true} renderItem={renderItem} />
```

### 3. Custom Dimension Function

Use `getItemDimensions` for dynamic dimension calculation:

```tsx
const getCustomDimensions = (item, index) => {
  // Make every 5th item extra wide
  if (index % 5 === 0) {
    return { width: 300, height: 150 };
  }

  // Featured items get special treatment
  if (item.featured) {
    return { width: 250, height: 200 };
  }

  // Return null for auto-calculation
  return null;
};

<ExpoMasonryLayout data={data} getItemDimensions={getCustomDimensions} renderItem={renderItem} />;
```

### 4. Mixed Layout Strategy

Combine all approaches for maximum flexibility:

```tsx
const mixedData = [
  {
    id: '1',
    width: 200,
    height: 300,
    preserveDimensions: true // Exact size
  },
  {
    id: '2',
    featured: true // Will use getItemDimensions
  },
  {
    id: '3',
    width: 400,
    height: 300 // Will be auto-calculated unless preserveItemDimensions=true
  }
];

<ExpoMasonryLayout
  data={mixedData}
  preserveItemDimensions={false}
  getItemDimensions={(item, index) => {
    if (item.featured) return { width: 250, height: 200 };
    return null;
  }}
  renderItem={renderItem}
/>;
```

**Priority Order:**

1. `getItemDimensions` function result (highest priority)
2. `preserveDimensions: true` on item + item's `width`/`height`
3. `preserveItemDimensions: true` prop + item's `width`/`height`
4. Auto-calculated from aspect ratio (lowest priority)

## �🎯 Performance Tips

1. **Provide Image Dimensions**: Include `width` and `height` in your data items for optimal layout calculation
2. **Memoize Render Function**: Use `useCallback` for your `renderItem` function
3. **Optimize Images**: Use appropriate image sizes and consider lazy loading
4. **Key Extractor**: Provide a stable `keyExtractor` function
5. **Batch Size**: Adjust `maxToRenderPerBatch` based on your item complexity

## 🧮 Layout Algorithm

The component supports two layout algorithms:

### Row Mode (default)

1. **Row Filling**: Items are added to rows based on available width
2. **Height Normalization**: All items in a row are scaled to the same height
3. **Width Justification**: The entire row is scaled to fill the available width
4. **Extra Height Pass**: If `getExtraHeight` is provided, row height becomes `max(imageHeight + extraHeight)`
5. **Vertical Positioning**: Items are vertically centered within their row

### Column Mode

1. **Column Width**: Calculated as `(screenWidth - spacing) / numColumns`
2. **Shortest-Column Placement**: Each item is placed in the column with the smallest cumulative height
3. **Height Calculation**: Image height derived from aspect ratio, plus `extraHeight` if provided
4. **Natural Band Boundaries**: Items are sliced into horizontal bands for VirtualizedList rendering. Band boundaries are placed at y-coordinates where all columns have a gap between items, ensuring no item is split across bands. This eliminates touch dead zones and visible gaps between bands.
5. **Shadow Support**: Item containers do not clip overflow, allowing shadows and decorations to render outside item bounds

Both modes ensure:

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
<a href="https://app.codacy.com/gh/echowaves/expo-masonry-layout/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://app.codacy.com/project/badge/Grade/dc6ea0352d0c422fbb82feb44a07d80b"/></a>