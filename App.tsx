import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import IncomeExpenseScreen from './src/screens/IncomeExpenseScreen';
import StockInfoScreen from './src/screens/StockInfoScreen';
import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: COLORS.background,
                        borderTopWidth: 0,
                        elevation: 0,
                        shadowOpacity: 0,
                        height: 60,
                        paddingBottom: 10,
                    },
                    tabBarActiveTintColor: COLORS.text,
                    tabBarInactiveTintColor: COLORS.textLight,
                }}
            >
                <Tab.Screen
                    name="Income/Expense"
                    component={IncomeExpenseScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="wallet" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Stock Info"
                    component={StockInfoScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
