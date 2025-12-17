import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Platform, StatusBar, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, NEUMORPHISM } from '../theme';
import { YahooFinanceService, StockDataPoint, StockMeta } from '../services/YahooFinanceService';

const SCREEN_WIDTH = Dimensions.get('window').width;

const STOCK_LIST = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

const RANGES = [
    { label: '1D', range: '1d', interval: '5m' },
    { label: '5D', range: '5d', interval: '15m' },
    { label: '1M', range: '1mo', interval: '1d' },
    { label: '6M', range: '6mo', interval: '1d' },
    { label: '1Y', range: '1y', interval: '1wk' },
];

export default function StockInfoScreen() {
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [selectedRange, setSelectedRange] = useState(RANGES[0]);
    const [chartData, setChartData] = useState<StockDataPoint[]>([]);
    const [meta, setMeta] = useState<StockMeta | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStockData = useCallback(async () => {
        setLoading(true);
        const result = await YahooFinanceService.getChartData(selectedSymbol, selectedRange.range, selectedRange.interval);
        if (result) {
            setMeta(result.meta);
            // Downsample data for chart performance if needed, but ChartKit handles modest amounts mostly ok.
            // For 1D (5m intervals), ~78 points.
            setChartData(result.data);
        }
        setLoading(false);
    }, [selectedSymbol, selectedRange]);

    useEffect(() => {
        fetchStockData();
    }, [fetchStockData]);

    const getChartLabels = () => {
        if (chartData.length === 0) return [];
        // Just show start, middle, end labels or simplify
        return [];
    };

    const getChartValues = () => {
        if (chartData.length === 0) return [0];
        return chartData.map(d => d.price);
    };

    const formatPrice = (price?: number) => {
        return price ? `$${price.toFixed(2)}` : '---';
    };

    const getChangeColor = () => {
        if (!meta) return COLORS.text;
        return meta.regularMarketPrice >= meta.previousClose ? '#4CAF50' : '#F44336';
    };

    const getChangeText = () => {
        if (!meta) return '';
        const change = meta.regularMarketPrice - meta.previousClose;
        const percent = (change / meta.previousClose) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percent.toFixed(2)}%)`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Market Watch</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Stock Display */}
                <View style={styles.mainInfoCard}>
                    <View style={styles.symbolRow}>
                        <Text style={styles.mainSymbol}>{selectedSymbol}</Text>
                        <Text style={styles.mainName}>{STOCK_LIST.find(s => s.symbol === selectedSymbol)?.name}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.mainPrice}>{formatPrice(meta?.regularMarketPrice)}</Text>
                        <Text style={[styles.mainChange, { color: getChangeColor() }]}>
                            {getChangeText()}
                        </Text>
                    </View>
                </View>

                {/* Range Selector */}
                <View style={styles.rangeSelector}>
                    {RANGES.map((r) => (
                        <TouchableOpacity
                            key={r.label}
                            style={[
                                styles.rangeBtn,
                                selectedRange.label === r.label && styles.rangeBtnActive
                            ]}
                            onPress={() => setSelectedRange(r)}
                        >
                            <Text style={[
                                styles.rangeText,
                                selectedRange.label === r.label && styles.rangeTextActive
                            ]}>{r.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : (
                        chartData.length > 0 ? (
                            <LineChart
                                data={{
                                    labels: [],
                                    datasets: [{ data: getChartValues() }]
                                }}
                                width={SCREEN_WIDTH - 40} // from react-native
                                height={220}
                                withDots={false}
                                withInnerLines={false}
                                withOuterLines={false}
                                withVerticalLines={false}
                                withHorizontalLines={false}
                                withVerticalLabels={false}
                                yAxisInterval={1}
                                chartConfig={{
                                    backgroundColor: COLORS.background,
                                    backgroundGradientFrom: COLORS.background,
                                    backgroundGradientTo: COLORS.background,
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => getChangeColor(),
                                    labelColor: (opacity = 1) => COLORS.textLight,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForDots: {
                                        r: "0",
                                    }
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        ) : (
                            <Text style={styles.noDataText}>No Data Available</Text>
                        )
                    )}
                </View>

                {/* Stock List Selector */}
                <Text style={styles.listHeader}>Watchlist</Text>
                {STOCK_LIST.map((item) => (
                    <TouchableOpacity
                        key={item.symbol}
                        style={[
                            styles.itemContainer,
                            selectedSymbol === item.symbol && styles.itemActive
                        ]}
                        onPress={() => setSelectedSymbol(item.symbol)}
                    >
                        <Text style={styles.itemSymbol}>{item.symbol}</Text>
                        <Text style={styles.itemName}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 20,
    },
    mainInfoCard: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        ...NEUMORPHISM.card,
        alignItems: 'center',
    },
    symbolRow: {
        alignItems: 'center',
        marginBottom: 10,
    },
    mainSymbol: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
    },
    mainName: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    priceRow: {
        alignItems: 'center',
    },
    mainPrice: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    mainChange: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 5,
    },
    rangeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 10,
        borderRadius: 15,
        ...NEUMORPHISM.card,
    },
    rangeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    rangeBtnActive: {
        backgroundColor: '#e0e5ec', // slightly darker neumorphic press
        ...NEUMORPHISM.button, // or specific pressed style
    },
    rangeText: {
        color: COLORS.textLight,
        fontWeight: '600',
    },
    rangeTextActive: {
        color: COLORS.text,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    noDataText: {
        color: COLORS.textLight,
        marginTop: 20,
    },
    listHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 20,
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        backgroundColor: COLORS.background,
        ...NEUMORPHISM.card,
    },
    itemActive: {
        borderColor: COLORS.primary, // or some indicator
        borderWidth: 1,
    },
    itemSymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.textLight,
    },
});
