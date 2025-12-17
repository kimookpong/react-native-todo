import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Image, Alert, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category } from '../types';
import { StorageService } from '../services/storage';
import { CategorySelector } from './CategorySelector';
import { COLORS, NEUMORPHISM } from '../theme';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
    editTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<Props> = ({ visible, onClose, onSave, onDelete, editTransaction }) => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (visible) {
            loadCategories();
            if (editTransaction) {
                setAmount(editTransaction.amount.toString());
                setNote(editTransaction.note);
                setType(editTransaction.type);
                setImageUri(editTransaction.imageUri || null);
                setCategoryId(editTransaction.categoryId || '');
            } else {
                resetFormState();
            }
        }
    }, [visible, editTransaction]);

    const resetFormState = () => {
        setAmount('');
        setNote('');
        setType('expense');
        setImageUri(null);
        setCategoryId('');
    };

    const loadCategories = async () => {
        const data = await StorageService.getCategories();
        setCategories(data);

        // Only auto-select if NOT editing and nothing selected
        if (!editTransaction) {
            const filtered = data.filter(c => c.type === type);
            if (filtered.length > 0 && !categoryId) {
                // Wait for type effect or handle here?
                // The type effect checks categories, so it might override if we are not careful.
            }
        }
    };

    // Reset/Default selection when type changes, BUT ONLY IF not just opened in edit mode with that type
    useEffect(() => {
        if (visible && !editTransaction) {
            const filtered = categories.filter(c => c.type === type);
            if (filtered.length > 0) {
                setCategoryId(filtered[0].id);
            } else {
                setCategoryId('');
            }
        }
    }, [type, categories, visible]);

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Camera permission is required to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.5,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }
        if (!categoryId) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        const newTransaction: Transaction = {
            id: editTransaction ? editTransaction.id : uuidv4(),
            type,
            amount: parseFloat(amount),
            note,
            categoryId,
            imageUri: imageUri || undefined,
            date: editTransaction ? editTransaction.date : new Date().toISOString(),
        };

        onSave(newTransaction);
        onClose();
    };

    const handleDelete = () => {
        if (editTransaction && onDelete) {
            Alert.alert(
                'Delete Transaction',
                'Are you sure you want to delete this transaction?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            onDelete(editTransaction.id);
                            onClose();
                        }
                    }
                ]
            );
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{editTransaction ? 'Edit Transaction' : 'Add Transaction'}</Text>

                    <ScrollView>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeButton, type === 'income' && styles.selectedTypeIncome]}
                                onPress={() => setType('income')}
                            >
                                <Text style={[styles.typeText, type === 'income' && styles.selectedTypeText]}>Income</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, type === 'expense' && styles.selectedTypeExpense]}
                                onPress={() => setType('expense')}
                            >
                                <Text style={[styles.typeText, type === 'expense' && styles.selectedTypeText]}>Expense</Text>
                            </TouchableOpacity>
                        </View>

                        <CategorySelector
                            categories={categories}
                            selectedId={categoryId}
                            onSelect={setCategoryId}
                            type={type}
                        />

                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                        />

                        <Text style={styles.label}>Note</Text>
                        <TextInput
                            style={styles.input}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Description"
                        />

                        <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
                            <Text style={styles.cameraButtonText}>
                                {imageUri ? 'Retake Photo' : 'Take Photo'}
                            </Text>
                        </TouchableOpacity>

                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        {editTransaction && (
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>{editTransaction ? 'Update' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)', // Lighter dimmer
    },
    contentContainer: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '90%',
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 25,
        textAlign: 'center',
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 25,
        gap: 15,
    },
    typeButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        ...NEUMORPHISM.button,
        borderWidth: 0, // Reset border from button style if we want to override
    },
    selectedTypeIncome: {
        backgroundColor: '#E8F5E9', // Light green
        borderWidth: 1,
        borderColor: COLORS.income,
    },
    selectedTypeExpense: {
        backgroundColor: '#FFEBEE', // Light red
        borderWidth: 1,
        borderColor: COLORS.expense,
    },
    typeText: {
        color: COLORS.textLight,
        fontWeight: '600',
        fontSize: 16,
    },
    selectedTypeText: {
        color: COLORS.text, // Keep dark text for readability on light pastel bg
        fontWeight: '700',
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        color: COLORS.text,
        fontWeight: '600',
        marginLeft: 5,
    },
    input: {
        backgroundColor: '#F5F5F5', // Slightly darker inner
        padding: 15,
        borderRadius: 15,
        fontSize: 16,
        marginBottom: 20,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        // Inner shadow simulation
    },
    cameraButton: {
        ...NEUMORPHISM.button,
        backgroundColor: COLORS.background,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    cameraButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 15,
    },
    cancelButton: {
        flex: 1,
        padding: 18,
        alignItems: 'center',
        borderRadius: 30, // Match button radius
        borderWidth: 0,
        // Flat or simple
    },
    cancelButtonText: {
        color: COLORS.textLight,
        fontWeight: '600',
        fontSize: 16,
    },
    deleteButton: {
        flex: 1,
        ...NEUMORPHISM.button,
        backgroundColor: '#FFEBEE',
        padding: 18,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: COLORS.expense,
        fontWeight: '700',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        ...NEUMORPHISM.button,
        backgroundColor: COLORS.primary,
        padding: 18,
        alignItems: 'center',
        borderWidth: 0, // Override default border
    },
    saveButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
});
