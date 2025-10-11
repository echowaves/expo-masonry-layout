import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ExpoMasonryLayout, MasonryItem, MasonryRenderItemInfo } from '../src';

interface Photo extends MasonryItem {
    id: string;
    uri: string;
    width?: number;
    height?: number;
}

const SAMPLE_DATA: Photo[] = [
    { id: '1', uri: 'https://picsum.photos/400/600', width: 400, height: 600 },
    { id: '2', uri: 'https://picsum.photos/300/400', width: 300, height: 400 },
    { id: '3', uri: 'https://picsum.photos/500/300', width: 500, height: 300 },
    { id: '4', uri: 'https://picsum.photos/600/800', width: 600, height: 800 },
    { id: '5', uri: 'https://picsum.photos/400/400', width: 400, height: 400 },
];

export const ExampleWithLayoutCallback: React.FC = () => {
    const [layoutInfo, setLayoutInfo] = useState<Map<string, MasonryRenderItemInfo>>(new Map());

    // Callback to track layout dimensions for each item
    const handleItemLayout = useCallback((info: MasonryRenderItemInfo) => {
        setLayoutInfo((prev) => {
            const next = new Map(prev);
            next.set(info.item.id, info);
            return next;
        });

        // Log the layout information
        console.log(`Item ${info.item.id} laid out at:`, {
            width: info.dimensions.width,
            height: info.dimensions.height,
            left: info.dimensions.left,
            top: info.dimensions.top,
            index: info.index
        });
    }, []);

    const renderItem = useCallback(({ item, dimensions }: MasonryRenderItemInfo) => {
        const photo = item as Photo;
        return (
            <View style={styles.itemWrapper}>
                <Image
                    source={{ uri: photo.uri }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.overlay}>
                    <Text style={styles.dimensionText}>
                        {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
                    </Text>
                </View>
            </View>
        );
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Layout Callback Example
                </Text>
                <Text style={styles.subHeaderText}>
                    {layoutInfo.size} items laid out
                </Text>
            </View>
            <ExpoMasonryLayout
                data={SAMPLE_DATA}
                renderItem={renderItem}
                onItemLayout={handleItemLayout}
                spacing={8}
                maxItemsPerRow={3}
                baseHeight={150}
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
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    subHeaderText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    itemWrapper: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8
    },
    dimensionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    }
});
