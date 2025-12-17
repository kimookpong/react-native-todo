import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BalanceSummary } from '../types';
import { COLORS, NEUMORPHISM } from '../theme';

interface Props {
    summary: BalanceSummary;
}

export const BalanceView: React.FC<Props> = ({ summary }) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>Total Balance</Text>
                <Text style={styles.balance}>${summary.balance.toLocaleString()}</Text>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <View style={styles.incomeBadge}>
                            <Text style={styles.subLabel}>Income</Text>
                        </View>
                        <Text style={styles.income}>+${summary.totalIncome.toLocaleString()}</Text>
                    </View>

                    <View style={styles.column}>
                        <View style={styles.expenseBadge}>
                            <Text style={styles.subLabel}>Expense</Text>
                        </View>
                        <Text style={styles.expense}>-${summary.totalExpense.toLocaleString()}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        padding: 25,
        alignItems: 'center',
        ...NEUMORPHISM.card,
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balance: {
        fontSize: 40,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 25,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    column: {
        alignItems: 'center',
        flex: 1,
    },
    subLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    incomeBadge: {
        marginBottom: 5,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    expenseBadge: {
        marginBottom: 5,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    income: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.income,
    },
    expense: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.expense,
    },
});
