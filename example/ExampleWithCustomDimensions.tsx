import React, { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ExpoMasonryLayout, { MasonryItem, MasonryRenderItemInfo } from '../src';

// Sample data demonstrating different dimension override strategies
const sampleData = Array.from({ length: 30 }, (_, index) => {
  const baseItem = {
    id: `item-${index}`,
    title: `Photo ${index + 1}`,
    imageUrl: `https://picsum.photos/${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}?random=${index}`,
    likes: Math.floor(Math.random() * 100)
  };

  // Different strategies for different items
  if (index % 7 === 0) {
    // Every 7th item: Large featured item with exact dimensions
    return {
      ...baseItem,
      width: 300,
      height: 200,
      preserveDimensions: true,
      title: `Featured: ${baseItem.title}`
    };
  } else if (index % 5 === 0) {
    // Every 5th item: Square with exact dimensions
    return {
      ...baseItem,
      width: 150,
      height: 150,
      preserveDimensions: true,
      title: `Square: ${baseItem.title}`
    };
  } else if (index % 3 === 0) {
    // Every 3rd item: Tall portrait with custom dimensions
    return {
      ...baseItem,
      width: 120,
      height: 180,
      title: `Portrait: ${baseItem.title}`
    };
  } else {
    // Regular items: Auto-calculated dimensions
    return {
      ...baseItem,
      width: Math.floor(Math.random() * 200) + 200,
      height: Math.floor(Math.random() * 200) + 200
    };
  }
});

const ExampleWithCustomDimensions: React.FC = () => {
  const [data, setData] = useState(sampleData);
  const [preserveDimensions, setPreserveDimensions] = useState(true);

  const handleItemPress = useCallback((item: any) => {
    Alert.alert('Item Pressed', `You tapped on ${item.title}`);
  }, []);

  // Custom dimension calculator function
  const getItemDimensions = useCallback((item: MasonryItem, index: number) => {
    // For demonstration: Make every 11th item extra wide
    if (index % 11 === 0) {
      return { width: 250, height: 100 };
    }
    // Return null to use default calculation
    return null;
  }, []);

  const renderItem = useCallback(
    ({ item, dimensions }: MasonryRenderItemInfo) => {
      // Determine item type for styling
      const isFeature = item.preserveDimensions && item.width === 300;
      const isSquare = item.preserveDimensions && item.width === 150;
      const isPortrait = !item.preserveDimensions && item.width === 120;

      return (
        <TouchableOpacity
          style={[
            styles.itemContainer,
            {
              width: dimensions.width,
              height: dimensions.height
            },
            isFeature && styles.featuredItem,
            isSquare && styles.squareItem,
            isPortrait && styles.portraitItem
          ]}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.overlay}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.subtitle}>
              {dimensions.width}×{dimensions.height}
            </Text>
            {item.preserveDimensions && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>EXACT</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [handleItemPress]
  );

  const handleRefresh = useCallback(() => {
    // Toggle dimension preservation mode
    setPreserveDimensions(!preserveDimensions);
  }, [preserveDimensions]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Custom Dimensions Demo</Text>
        <Text style={styles.headerSubtitle}>
          Mode: {preserveDimensions ? 'Preserve Exact Dimensions' : 'Auto-Calculate'}
        </Text>
      </View>

      <ExpoMasonryLayout
        data={data}
        renderItem={renderItem}
        spacing={8}
        maxItemsPerRow={4}
        baseHeight={120}
        preserveItemDimensions={preserveDimensions}
        getItemDimensions={getItemDimensions}
        onRefresh={handleRefresh}
        refreshing={false}
        style={styles.masonryContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  masonryContainer: {
    flex: 1
  },
  itemContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  featuredItem: {
    borderWidth: 3,
    borderColor: '#ff6b6b'
  },
  squareItem: {
    borderWidth: 2,
    borderColor: '#4ecdc4'
  },
  portraitItem: {
    borderWidth: 2,
    borderColor: '#45b7d1'
  },
  image: {
    width: '100%',
    flex: 1
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2
  },
  badge: {
    position: 'absolute',
    top: -24,
    right: 8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold'
  }
});

export default ExampleWithCustomDimensions;
