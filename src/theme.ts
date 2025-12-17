import { ViewStyle, TextStyle } from 'react-native';

export const COLORS = {
    background: '#EFEEEE',
    text: '#4A4A4A',
    textLight: '#888888',
    primary: '#576FE6',
    income: '#4CAF50',
    expense: '#F44336',
    white: '#FFFFFF',
    shadowLight: '#FFFFFF',
    shadowDark: '#D1D9E6',
};

export const NEUMORPHISM: {
    card: ViewStyle;
    button: ViewStyle;
    inner: ViewStyle; // Placeholder for concave if needed
} = {
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8, // Android fallback
        // We can't do dual shadow easily in RN without a library or extra views.
        // For now, we'll use a strong single shadow that matches the background color blend.
        // Or we use a trick: white border top/left?
        // Let's stick to standard RN shadow for "Dark" and maybe a light border for "Light"
        borderWidth: 1,
        borderColor: 'rgba(255,255,255, 0.4)',
    },
    button: {
        backgroundColor: COLORS.background,
        borderRadius: 30, // More rounded for buttons
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 5,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'rgba(255,255,255, 0.8)',
    },
    inner: {
        // simulated inner shadow usually requires tricks or libraries
        backgroundColor: '#E6E6E6',
        borderColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
    }
};
