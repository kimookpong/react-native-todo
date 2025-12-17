import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, Text, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';
import { Transaction, BalanceSummary, Category } from '../types';
import { TransactionItem } from '../components/TransactionItem';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { BalanceView } from '../components/BalanceView';
import { CategoryManagementModal } from '../components/CategoryManagementModal';
import { COLORS, NEUMORPHISM } from '../theme';

export default function IncomeExpenseScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [summary, setSummary] = useState<BalanceSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const loadData = async () => {
        const data = await StorageService.getTransactions();
        setTransactions(data);
        setSummary(StorageService.calculateBalance(data));

        const catData = await StorageService.getCategories();
        setCategories(catData);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveTransaction = async (transaction: Transaction) => {
        if (editingTransaction) {
            await StorageService.updateTransaction(transaction);
        } else {
            await StorageService.saveTransaction(transaction);
        }
        await loadData();
        setModalVisible(false);
        setEditingTransaction(null);
    };

    const handleDeleteTransaction = async (id: string) => {
        await StorageService.deleteTransaction(id);
        await loadData();
        setModalVisible(false);
        setEditingTransaction(null);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setModalVisible(true);
    };

    const handleAddNew = () => {
        setEditingTransaction(null);
        setModalVisible(true);
    };

    const getCategory = (id?: string) => {
        return categories.find(c => c.id === id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Wallet</Text>
                <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={styles.settingsBtn}>
                    <MaterialCommunityIcons name="cog" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <BalanceView summary={summary} />

            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TransactionItem
                        item={item}
                        category={getCategory(item.categoryId)}
                        onPress={() => handleEdit(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No transactions yet</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddNew}
            >
                <MaterialCommunityIcons name="plus" size={32} color={COLORS.text} />
            </TouchableOpacity>

            <AddTransactionModal
                visible={modalVisible}
                onClose={() => { setModalVisible(false); setEditingTransaction(null); }}
                onSave={handleSaveTransaction}
                onDelete={handleDeleteTransaction}
                editTransaction={editingTransaction}
            />

            <CategoryManagementModal
                visible={categoryModalVisible}
                onClose={() => setCategoryModalVisible(false)}
                onUpdate={loadData}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    settingsBtn: {
        padding: 10,
        borderRadius: 20,
        ...NEUMORPHISM.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        ...NEUMORPHISM.button,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
});
