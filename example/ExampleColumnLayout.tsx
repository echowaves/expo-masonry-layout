import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ExpoMasonryLayout, { MasonryRenderItemInfo, ColumnsConfig } from '../src';

// Sample data with various aspect ratios
const sampleData = Array.from({ length: 50 }, (_, index) => ({
    id: `item-${index}`,
    title: `Photo ${index + 1}`,
    imageUrl: `https://picsum.photos/${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}?random=${index}`,
    width: Math.floor(Math.random() * 200) + 200,
    height: Math.floor(Math.random() * 200) + 200,
}));

// Responsive breakpoints: 1 column on small phones, 2 on tablets, 3 on wider screens
const columns: ColumnsConfig = {
    default: 3,
    768: 2,
    400: 1,
};

const ExampleColumnLayout: React.FC = () => {
    const [data, setData] = useState(sampleData);
    const [refreshing, setRefreshing] = useState(false);

    const renderItem = useCallback(
        ({ item, dimensions }: MasonryRenderItemInfo) => (
            <TouchableOpacity
                style={[styles.itemContainer, { width: dimensions.width, height: dimensions.height }]}
                activeOpacity={0.8}
            >
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                <View style={styles.overlay}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                </View>
            </TouchableOpacity>
        ),
        []
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setData(shuffled);
        setRefreshing(false);
    }, [data]);

    return (
        <ExpoMasonryLayout
            data={data}
            renderItem={renderItem}
            layoutMode="column"
            columns={columns}
            spacing={8}
            refreshing={refreshing}
            onRefresh={handleRefresh}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 6,
    },
    title: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ExampleColumnLayout;
