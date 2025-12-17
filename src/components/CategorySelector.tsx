import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../types';
import { COLORS, NEUMORPHISM } from '../theme';

interface Props {
    categories: Category[];
    selectedId: string;
    onSelect: (id: string) => void;
    type: 'income' | 'expense';
}

export const CategorySelector: React.FC<Props> = ({ categories, selectedId, onSelect, type }) => {
    const filtered = useMemo(() => {
        return categories.filter(c => c.type === type);
    }, [categories, type]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {filtered.map(category => {
                    const isSelected = category.id === selectedId;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.item,
                                isSelected && styles.selectedItem
                            ]}
                            onPress={() => onSelect(category.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer,
                                isSelected ? styles.selectedIconContainer : styles.unselectedIconContainer
                            ]}>
                                <MaterialCommunityIcons
                                    name={category.icon as any}
                                    size={24}
                                    color={isSelected ? COLORS.white : COLORS.textLight}
                                />
                            </View>
                            <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        color: COLORS.text,
        fontWeight: '600',
        marginLeft: 5,
    },
    scrollContent: {
        paddingHorizontal: 5,
        paddingBottom: 10, // space for shadows
    },
    item: {
        alignItems: 'center',
        marginRight: 15,
        width: 70,
    },
    itemText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 5,
        textAlign: 'center',
    },
    selectedItem: {
        // transform: [{ scale: 1.05 }], // Scale effect
    },
    selectedItemText: {
        color: COLORS.text,
        fontWeight: '700',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        ...NEUMORPHISM.button, // Base button style (convex)
    },
    unselectedIconContainer: {
        backgroundColor: COLORS.background,
    },
    selectedIconContainer: {
    },
});
