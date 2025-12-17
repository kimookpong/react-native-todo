import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction, Category } from '../types';
import { COLORS, NEUMORPHISM } from '../theme';

interface Props {
    item: Transaction;
    category?: Category;
    onPress: () => void;
}

export const TransactionItem: React.FC<Props> = ({ item, category, onPress }) => {
    const isIncome = item.type === 'income';

    // Format date
    const dateObj = new Date(item.date);
    const dateStr = dateObj.toLocaleDateString();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.leftContainer}>
                <View style={styles.iconContainer}>
                    {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} style={styles.imageIcon} />
                    ) : (
                        <MaterialCommunityIcons
                            name={category?.icon as any || (isIncome ? 'cash' : 'cart')}
                            size={24}
                            color={COLORS.textLight}
                        />
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                        {category?.name || item.note || (isIncome ? 'Income' : 'Expense')}
                    </Text>
                    {item.note ? (
                        <Text style={styles.note} numberOfLines={1}>{item.note}</Text>
                    ) : null}
                    <Text style={styles.date}>{dateStr}</Text>
                </View>
            </View>

            <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
                {isIncome ? '+' : '-'}{item.amount.toLocaleString()}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        ...NEUMORPHISM.card,
        borderRadius: 15, // Slightly smaller radius for list items
        marginVertical: 8,
        marginHorizontal: 2, // Ensure shadow isn't cut off if flatlist has padding
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 80,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        // Concave effect for icon container?
        backgroundColor: '#EBEBEB',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    imageIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    textContainer: {
        justifyContent: 'center',
        flex: 1,
        marginRight: 10,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    note: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
    },
    income: {
        color: COLORS.income,
    },
    expense: {
        color: COLORS.expense,
    },
});
