import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ExpoMasonryLayout, { MasonryItem, MasonryRenderItemInfo } from '../src';

// Sample data with various aspect ratios
const sampleData = Array.from({ length: 40 }, (_, index) => ({
    id: `item-${index}`,
    title: `Photo ${index + 1}`,
    imageUrl: `https://picsum.photos/${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}?random=${index}`,
    width: Math.floor(Math.random() * 200) + 200,
    height: Math.floor(Math.random() * 200) + 200,
    description: `This is a detailed description for photo ${index + 1}. It contains more information that is shown when the item is expanded inline.`,
    comments: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => `Comment ${j + 1} on photo ${index + 1}`),
}));

const getExpandedHeight = (item: MasonryItem, fullWidth: number): number => {
    const imageHeight = Math.floor(fullWidth / ((item.width ?? 300) / (item.height ?? 300)));
    const descriptionHeight = 60;
    const commentsHeight = ((item.comments as string[])?.length ?? 0) * 32;
    const actionsHeight = 50;
    const padding = 24;
    return imageHeight + descriptionHeight + commentsHeight + actionsHeight + padding;
};

const ExampleInlineExpand: React.FC = () => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const renderItem = useCallback(
        ({ item, dimensions, isExpanded }: MasonryRenderItemInfo) => {
            if (isExpanded) {
                const imageHeight = Math.floor(
                    dimensions.width / ((item.width ?? 300) / (item.height ?? 300))
                );
                return (
                    <TouchableOpacity
                        style={[styles.expandedContainer, { width: dimensions.width, height: dimensions.height }]}
                        onPress={() => toggleExpand(item.id)}
                        activeOpacity={0.95}
                    >
                        <Image
                            source={{ uri: item.imageUrl as string }}
                            style={{ width: dimensions.width, height: imageHeight }}
                            resizeMode="cover"
                        />
                        <View style={styles.expandedContent}>
                            <Text style={styles.expandedTitle}>{item.title as string}</Text>
                            <Text style={styles.expandedDescription}>{item.description as string}</Text>
                            {((item.comments as string[]) ?? []).map((comment, i) => (
                                <Text key={i} style={styles.comment}>💬 {comment}</Text>
                            ))}
                            <View style={styles.actions}>
                                <Text style={styles.actionButton}>❤️ Like</Text>
                                <Text style={styles.actionButton}>💬 Comment</Text>
                                <Text style={styles.actionButton}>📤 Share</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            }

            return (
                <TouchableOpacity
                    style={[styles.itemContainer, { width: dimensions.width, height: dimensions.height }]}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: item.imageUrl as string }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={styles.overlay}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title as string}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [toggleExpand]
    );

    return (
        <ExpoMasonryLayout
            data={sampleData}
            renderItem={renderItem}
            layoutMode="column"
            columns={3}
            spacing={8}
            expandedItemIds={expandedIds}
            getExpandedHeight={getExpandedHeight}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
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
    expandedContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    expandedContent: {
        padding: 12,
    },
    expandedTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    expandedDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    comment: {
        fontSize: 13,
        color: '#333',
        paddingVertical: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionButton: {
        fontSize: 14,
        color: '#007AFF',
    },
});

export default ExampleInlineExpand;
