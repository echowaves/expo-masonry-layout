import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ExpoMasonryLayout, { MasonryRenderItemInfo, MasonryItem } from '../src';

// Sample data — some items have captions, some don't
const sampleData = Array.from({ length: 40 }, (_, index) => ({
    id: `item-${index}`,
    title: `Photo ${index + 1}`,
    imageUrl: `https://picsum.photos/${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}?random=${index}`,
    width: Math.floor(Math.random() * 200) + 200,
    height: Math.floor(Math.random() * 200) + 200,
    // Only some items have a caption
    caption: index % 3 === 0 ? `This is a caption for photo ${index + 1}. It adds extra height below the image.` : undefined,
}));

const CAPTION_LINE_HEIGHT = 18;
const CAPTION_PADDING = 8;

/**
 * Calculate extra height needed below the image for the caption text.
 * The computed width lets us estimate how many lines the text will need.
 */
function getExtraHeight(item: MasonryItem, computedWidth: number): number {
    const caption = item.caption as string | undefined;
    if (!caption) return 0;

    const charsPerLine = Math.floor(computedWidth / 8); // rough estimate
    const numLines = Math.ceil(caption.length / charsPerLine);
    return numLines * CAPTION_LINE_HEIGHT + CAPTION_PADDING * 2;
}

const ExampleWithExtraHeight: React.FC = () => {
    const [data] = useState(sampleData);

    const renderItem = useCallback(
        ({ item, dimensions, extraHeight }: MasonryRenderItemInfo) => {
            const imageHeight = dimensions.height - extraHeight;
            return (
                <View style={[styles.itemContainer, { width: dimensions.width, height: dimensions.height }]}>
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: dimensions.width, height: imageHeight }}
                        resizeMode="cover"
                    />
                    {item.caption ? (
                        <View style={styles.captionContainer}>
                            <Text style={styles.captionText}>{item.caption as string}</Text>
                        </View>
                    ) : null}
                </View>
            );
        },
        []
    );

    return (
        <ExpoMasonryLayout
            data={data}
            renderItem={renderItem}
            layoutMode="column"
            columns={2}
            spacing={8}
            getExtraHeight={getExtraHeight}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    captionContainer: {
        padding: CAPTION_PADDING,
    },
    captionText: {
        fontSize: 13,
        lineHeight: CAPTION_LINE_HEIGHT,
        color: '#333',
    },
});

export default ExampleWithExtraHeight;
