import React, { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ExpoMasonryLayout, { MasonryRenderItemInfo } from '../src';

// Sample data with various aspect ratios
const sampleData = Array.from({ length: 50 }, (_, index) => ({
  id: `item-${index}`,
  title: `Photo ${index + 1}`,
  imageUrl: `https://picsum.photos/${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}?random=${index}`,
  width: Math.floor(Math.random() * 200) + 200,
  height: Math.floor(Math.random() * 200) + 200,
  likes: Math.floor(Math.random() * 100)
}));

const ExampleMasonryGrid: React.FC = () => {
  const [data, setData] = useState(sampleData);
  const [refreshing, setRefreshing] = useState(false);

  const handleItemPress = useCallback((item: any) => {
    Alert.alert('Item Pressed', `You tapped on ${item.title}`);
  }, []);

  const renderItem = useCallback(
    ({ item, dimensions }: MasonryRenderItemInfo) => (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            width: dimensions.width,
            height: dimensions.height
          }
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.statsContainer}>
            <Text style={styles.likes}>❤️ {item.likes}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleItemPress]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Shuffle the data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setData(shuffled);

    setRefreshing(false);
  }, [data]);

  const handleLoadMore = useCallback(async () => {
    // Simulate loading more data
    const moreData = Array.from({ length: 20 }, (_, index) => ({
      id: `item-${data.length + index}`,
      title: `Photo ${data.length + index + 1}`,
      imageUrl: `https://picsum.photos/${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}?random=${data.length + index}`,
      width: Math.floor(Math.random() * 200) + 200,
      height: Math.floor(Math.random() * 200) + 200,
      likes: Math.floor(Math.random() * 100)
    }));

    setData((prevData) => [...prevData, ...moreData]);
  }, [data.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expo Masonry Layout</Text>
        <Text style={styles.headerSubtitle}>{data.length} photos • Pull to refresh</Text>
      </View>

      <ExpoMasonryLayout
        data={data}
        renderItem={renderItem}
        spacing={8}
        maxItemsPerRow={3}
        baseHeight={150}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        style={styles.masonryContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  masonryContainer: {
    flex: 1
  },
  contentContainer: {
    padding: 8
  },
  itemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  image: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  likes: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9
  }
});

export default ExampleMasonryGrid;
