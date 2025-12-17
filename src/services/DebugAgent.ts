import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';

export interface DebugLog {
    timestamp: number;
    message: string;
    data?: any;
    level: 'info' | 'warn' | 'error';
}

class DebugAgentService {
    private logs: DebugLog[] = [];
    private maxLogs: number = 100;

    log(message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info') {
        const entry: DebugLog = {
            timestamp: Date.now(),
            message,
            data,
            level,
        };
        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        if (__DEV__) {
            console.log(`[DebugAgent] [${level.toUpperCase()}] ${message}`, data || '');
        }
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }

    async getStorageDump(): Promise<Record<string, any>> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const result: Record<string, any> = {};
            const multiGet = await AsyncStorage.multiGet(keys);

            multiGet.forEach(([key, value]) => {
                try {
                    result[key] = value ? JSON.parse(value) : null;
                } catch {
                    result[key] = value;
                }
            });

            return result;
        } catch (error) {
            this.log('Failed to dump storage', error, 'error');
            return {};
        }
    }

    async runDiagnostics() {
        const diagnostics = {
            storageAccessible: false,
            transactionCount: 0,
            lastError: null as string | null,
        };

        try {
            // Check storage access
            await AsyncStorage.getItem('test_access');
            diagnostics.storageAccessible = true;

            // Check business logic data
            const txs = await StorageService.getTransactions();
            diagnostics.transactionCount = txs.length;

        } catch (error: any) {
            diagnostics.lastError = error.message;
            this.log('Diagnostics failed', error, 'error');
        }

        return diagnostics;
    }
}

export const DebugAgent = new DebugAgentService();
