// Example: Custom Dimensions Usage
import React from 'react'
import { Image, Text, View } from 'react-native'

import ExpoMasonryLayout, {
  MasonryItem,
  MasonryRenderItemInfo,
} from 'expo-masonry-layout'

// Example 1: Using preserveDimensions per item
const dataWithMixedSizing: MasonryItem[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/300/200',
    width: 300,
    height: 200,
    preserveDimensions: true, // This item will be exactly 300x200
    title: 'Featured Image - Exact Size',
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/400/300',
    width: 400,
    height: 300,
    // No preserveDimensions - will be auto-calculated
    title: 'Auto-sized Image',
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/150/150',
    width: 150,
    height: 150,
    preserveDimensions: true, // Square exact size
    title: 'Square Thumbnail',
  },
];

// Example 2: Custom dimension calculator
const getCustomDimensions = (item: MasonryItem, index: number) => {
  // Make every 5th item extra wide for featured content
  if (index % 5 === 0) {
    return { width: 300, height: 150 };
  }

  // Special handling for certain item types
  if (item.type === 'banner') {
    return { width: 350, height: 100 };
  }

  // Return null to use default calculation
  return null;
};

// Example 3: Component usage
export const CustomDimensionsExample = () => {
  const renderItem = ({ item, dimensions }: MasonryRenderItemInfo) => (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: '100%', flex: 1 }}
        resizeMode="cover"
      />
      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{item.title}</Text>
        <Text style={{ fontSize: 10, color: '#666' }}>
          {dimensions.width}×{dimensions.height}
          {item.preserveDimensions && ' (exact)'}
        </Text>
      </View>
    </View>
  );

  return (
    <ExpoMasonryLayout
      data={dataWithMixedSizing}
      renderItem={renderItem}
      spacing={8}
      maxItemsPerRow={3}
      // Option 1: Preserve dimensions globally for items that have width/height
      preserveItemDimensions={false} // Individual items can still use preserveDimensions: true
      // Option 2: Use custom dimension function
      getItemDimensions={getCustomDimensions}
      style={{ flex: 1 }}
    />
  );
};

// Example 4: All items respect exact dimensions
export const ExactDimensionsExample = () => {
  const exactSizeData: MasonryItem[] = [
    {
      id: '1',
      width: 200,
      height: 300,
      imageUrl: 'https://picsum.photos/200/300',
    },
    {
      id: '2',
      width: 150,
      height: 150,
      imageUrl: 'https://picsum.photos/150/150',
    },
    {
      id: '3',
      width: 250,
      height: 180,
      imageUrl: 'https://picsum.photos/250/180',
    },
  ];

  return (
    <ExpoMasonryLayout
      data={exactSizeData}
      renderItem={({ item, dimensions }) => (
        <Image
          source={{ uri: item.imageUrl as string }}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: 4,
          }}
        />
      )}
      preserveItemDimensions={true} // Respect all provided dimensions
      spacing={6}
    />
  );
};

export default CustomDimensionsExample;
