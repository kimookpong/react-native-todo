import React from 'react';
import { StyleSheet, View, FlatList, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { COLORS, NEUMORPHISM } from '../theme';

// Mock Data
const STOCK_DATA = [
    { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: '198.11', change: '+2.14%' },
    { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', price: '141.80', change: '-0.56%' },
    { id: '3', symbol: 'MSFT', name: 'Microsoft Corp.', price: '374.58', change: '+1.02%' },
    { id: '4', symbol: 'TSLA', name: 'Tesla Inc.', price: '243.84', change: '-1.25%' },
    { id: '5', symbol: 'AMZN', name: 'Amazon.com', price: '147.42', change: '+0.88%' },
];

export default function StockInfoScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Market Watch</Text>
            </View>

            <FlatList
                data={STOCK_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <View>
                            <Text style={styles.symbol}>{item.symbol}</Text>
                            <Text style={styles.name}>{item.name}</Text>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>${item.price}</Text>
                            <Text style={[
                                styles.change,
                                { color: item.change.startsWith('+') ? '#4CAF50' : '#F44336' }
                            ]}>
                                {item.change}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        padding: 20,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    listContent: {
        padding: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginBottom: 15,
        borderRadius: 15,
        backgroundColor: COLORS.background,
        ...NEUMORPHISM.card,
    },
    symbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    name: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 4,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    change: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
});
