import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageService } from '../services/storage';
import { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { COLORS, NEUMORPHISM } from '../theme';

const ICONS = [
    'food', 'bus', 'cart', 'movie', 'heart', 'cash', 'briefcase', 'school',
    'gift', 'gamepad', 'home', 'airplane', 'car', 'bank', 'hospital', 'book'
];

interface Props {
    visible: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const CategoryManagementModal: React.FC<Props> = ({ visible, onClose, onUpdate }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [icon, setIcon] = useState('help-circle');

    useEffect(() => {
        if (visible) {
            loadCategories();
            resetForm();
            setView('list');
        }
    }, [visible]);

    const loadCategories = async () => {
        const data = await StorageService.getCategories();
        setCategories(data);
    };

    const resetForm = () => {
        setName('');
        setType('expense');
        setIcon('help-circle');
        setEditingCategory(null);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setType(category.type);
        setIcon(category.icon);
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Category', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await StorageService.deleteCategory(id);
                        loadCategories();
                        onUpdate();
                    } catch (e) {
                        Alert.alert('Error', 'Could not delete category');
                    }
                }
            }
        ]);
    };

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        const newCategory: Category = {
            id: editingCategory ? editingCategory.id : uuidv4(),
            name,
            type,
            icon,
            isDefault: editingCategory ? editingCategory.isDefault : false
        };

        await StorageService.saveCategory(newCategory);
        loadCategories();
        onUpdate();
        setView('list');
    };

    const renderItem = ({ item }: { item: Category }) => (
        <View style={styles.listItem}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, item.type === 'income' ? styles.incomeIcon : styles.expenseIcon]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                    <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                {!item.isDefault && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                        <MaterialCommunityIcons name="delete" size={20} color={COLORS.expense} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {view === 'list' ? 'Manage Categories' : (view === 'add' ? 'New Category' : 'Edit Category')}
                        </Text>
                        {view === 'list' ? (
                            <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setView('add'); }}>
                                <MaterialCommunityIcons name="plus" size={24} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.backButton} onPress={() => setView('list')}>
                                <Text style={styles.backText}>Back</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {view === 'list' ? (
                        <FlatList
                            data={categories}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
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

                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Category Name"
                            />

                            <Text style={styles.label}>Icon</Text>
                            <View style={styles.iconGrid}>
                                {ICONS.map(iconName => (
                                    <TouchableOpacity
                                        key={iconName}
                                        style={[styles.iconOption, icon === iconName && styles.selectedIcon]}
                                        onPress={() => setIcon(iconName)}
                                    >
                                        <MaterialCommunityIcons
                                            name={iconName as any}
                                            size={24}
                                            color={icon === iconName ? 'white' : COLORS.textLight}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save Category</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    contentContainer: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        height: '90%',
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...NEUMORPHISM.button,
    },
    backButton: {
        padding: 10,
    },
    backText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    listItem: {
        ...NEUMORPHISM.card,
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        marginHorizontal: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    incomeIcon: {
        backgroundColor: COLORS.income,
    },
    expenseIcon: {
        backgroundColor: COLORS.expense,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 15,
    },
    actionBtn: {
        padding: 5,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        ...NEUMORPHISM.button,
        borderWidth: 0,
    },
    selectedTypeIncome: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: COLORS.income,
    },
    selectedTypeExpense: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: COLORS.expense,
    },
    typeText: {
        color: COLORS.textLight,
        fontWeight: '600',
    },
    selectedTypeText: {
        color: COLORS.text,
        fontWeight: '700',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 10,
        marginLeft: 5,
    },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 15,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 25,
        justifyContent: 'center',
    },
    iconOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    selectedIcon: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    saveButton: {
        ...NEUMORPHISM.button,
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    closeButton: {
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        color: COLORS.textLight,
        fontWeight: '600',
        fontSize: 16,
    },
});
