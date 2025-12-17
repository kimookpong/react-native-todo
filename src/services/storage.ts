import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, BalanceSummary, Category } from '../types';

const STORAGE_KEY = '@transactions_v1';

export const StorageService = {
    async getTransactions(): Promise<Transaction[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Failed to load transactions', e);
            return [];
        }
    },

    async saveTransaction(transaction: Transaction): Promise<void> {
        try {
            const existing = await this.getTransactions();
            const updated = [transaction, ...existing];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save transaction', e);
            throw e;
        }
    },

    async updateTransaction(transaction: Transaction): Promise<void> {
        try {
            const existing = await this.getTransactions();
            const index = existing.findIndex(t => t.id === transaction.id);
            if (index !== -1) {
                const updated = [...existing];
                updated[index] = transaction;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }
        } catch (e) {
            console.error('Failed to update transaction', e);
            throw e;
        }
    },

    async deleteTransaction(id: string): Promise<void> {
        try {
            const existing = await this.getTransactions();
            const updated = existing.filter(t => t.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to delete transaction', e);
            throw e;
        }
    },

    async getCategories(): Promise<Category[]> {
        try {
            const jsonValue = await AsyncStorage.getItem('@categories_v1');
            if (jsonValue != null) {
                return JSON.parse(jsonValue);
            }
            // Return defaults if empty
            return [
                { id: '1', name: 'Salary', icon: 'cash', type: 'income', isDefault: true },
                { id: '2', name: 'Business', icon: 'briefcase', type: 'income', isDefault: true },
                { id: '3', name: 'Food', icon: 'food', type: 'expense', isDefault: true },
                { id: '4', name: 'Transport', icon: 'bus', type: 'expense', isDefault: true },
                { id: '5', name: 'Shopping', icon: 'cart', type: 'expense', isDefault: true },
                { id: '6', name: 'Entertainment', icon: 'movie', type: 'expense', isDefault: true },
                { id: '7', name: 'Health', icon: 'heart', type: 'expense', isDefault: true },
            ];
        } catch (e) {
            console.error('Failed to load categories', e);
            return [];
        }
    },

    async saveCategory(category: Category): Promise<void> {
        try {
            const categories = await this.getCategories();
            const index = categories.findIndex(c => c.id === category.id);
            let updated;
            if (index >= 0) {
                updated = [...categories];
                updated[index] = category;
            } else {
                updated = [...categories, category];
            }
            await AsyncStorage.setItem('@categories_v1', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save category', e);
            throw e;
        }
    },

    async deleteCategory(id: string): Promise<void> {
        try {
            const categories = await this.getCategories();
            const updated = categories.filter(c => c.id !== id);
            await AsyncStorage.setItem('@categories_v1', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to delete category', e);
            throw e;
        }
    },

    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            await AsyncStorage.removeItem('@categories_v1');
        } catch (e) {
            console.error('Failed to clear storage', e);
        }
    },

    calculateBalance(transactions: Transaction[]): BalanceSummary {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    }
};
