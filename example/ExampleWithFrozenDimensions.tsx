import React, { useCallback, useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
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
    { id: '6', uri: 'https://picsum.photos/350/500', width: 350, height: 500 },
    { id: '7', uri: 'https://picsum.photos/450/350', width: 450, height: 350 },
];

/**
 * Example demonstrating how to "freeze" item dimensions after initial layout.
 * This is useful for:
 * - Preventing layout shifts when screen rotates
 * - Maintaining consistent layout when data changes
 * - Performance optimization by avoiding recalculations
 */
export const ExampleWithFrozenDimensions: React.FC = () => {
    // Store frozen dimensions in a ref (survives re-renders)
    const frozenDimensionsRef = useRef<Map<string, { width: number; height: number; }>>(new Map());
    const [isFrozen, setIsFrozen] = useState(false);
    const [layoutCount, setLayoutCount] = useState(0);

    // Capture dimensions as items are laid out
    const handleItemLayout = useCallback((info: MasonryRenderItemInfo) => {
        if (!isFrozen) {
            frozenDimensionsRef.current.set(info.item.id, {
                width: info.dimensions.width,
                height: info.dimensions.height
            });
            setLayoutCount(frozenDimensionsRef.current.size);
        }

        console.log(`Item ${info.item.id} laid out at:`, {
            width: info.dimensions.width,
            height: info.dimensions.height,
            frozen: isFrozen
        });
    }, [isFrozen]);

    // When frozen, return saved dimensions; when not frozen, return null to allow recalculation
    const getItemDimensions = useCallback((item: MasonryItem, _index: number) => {
        if (isFrozen) {
            const frozen = frozenDimensionsRef.current.get(item.id);
            if (frozen) {
                return frozen;
            }
        }
        return null; // Let the component calculate dimensions
    }, [isFrozen]);

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
                    {isFrozen && (
                        <Text style={styles.frozenBadge}>🔒 FROZEN</Text>
                    )}
                </View>
            </View>
        );
    }, [isFrozen]);

    const toggleFreeze = () => {
        setIsFrozen(!isFrozen);
    };

    const resetDimensions = () => {
        frozenDimensionsRef.current.clear();
        setIsFrozen(false);
        setLayoutCount(0);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Frozen Dimensions Example
                </Text>
                <Text style={styles.subHeaderText}>
                    {layoutCount} items captured • Status: {isFrozen ? '🔒 FROZEN' : '🔓 DYNAMIC'}
                </Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title={isFrozen ? "Unfreeze Layout" : "Freeze Layout"}
                        onPress={toggleFreeze}
                        color={isFrozen ? "#ff6b6b" : "#4CAF50"}
                    />
                    <View style={styles.buttonSpacer} />
                    <Button
                        title="Reset All"
                        onPress={resetDimensions}
                        color="#2196F3"
                    />
                </View>
                <Text style={styles.helpText}>
                    {isFrozen
                        ? "Layout is frozen. Rotate screen or resize window - dimensions won't change!"
                        : "Layout is dynamic. Press 'Freeze Layout' to lock current dimensions."}
                </Text>
            </View>
            <ExpoMasonryLayout
                data={SAMPLE_DATA}
                renderItem={renderItem}
                onItemLayout={handleItemLayout}
                getItemDimensions={getItemDimensions}
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
        marginTop: 4,
        marginBottom: 12
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 12
    },
    buttonSpacer: {
        width: 12
    },
    helpText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic'
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
    },
    frozenBadge: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2
    }
});
