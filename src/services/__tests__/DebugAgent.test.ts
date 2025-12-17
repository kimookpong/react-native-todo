import AsyncStorage from '@react-native-async-storage/async-storage';
import { DebugAgent } from '../DebugAgent';
import { StorageService } from '../storage';

// Mock StorageService
jest.mock('../storage', () => ({
    StorageService: {
        getTransactions: jest.fn(),
    },
}));

describe('DebugAgent', () => {
    beforeEach(() => {
        DebugAgent.clearLogs();
        jest.clearAllMocks();
    });

    it('should log messages correctly', () => {
        DebugAgent.log('Test message', { foo: 'bar' });
        const logs = DebugAgent.getLogs();
        expect(logs).toHaveLength(1);
        expect(logs[0].message).toBe('Test message');
        expect(logs[0].data).toEqual({ foo: 'bar' });
        expect(logs[0].level).toBe('info');
    });

    it('should cap logs at max limit', () => {
        // Default max is 100
        for (let i = 0; i < 110; i++) {
            DebugAgent.log(`Message ${i}`);
        }
        const logs = DebugAgent.getLogs();
        expect(logs).toHaveLength(100);
        // Should have the latest messages (LIFO - unshifted, popped)
        // Wait, unshift adds to beginning, pop removes from end. So logs[0] is latest.
        expect(logs[0].message).toBe('Message 109');
    });

    it('runDiagnostics should check storage', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('ok');
        (StorageService.getTransactions as jest.Mock).mockResolvedValue([1, 2, 3]);

        const result = await DebugAgent.runDiagnostics();

        expect(result.storageAccessible).toBe(true);
        expect(result.transactionCount).toBe(3);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('test_access');
    });

    it('runDiagnostics should handle errors', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage Error'));

        const result = await DebugAgent.runDiagnostics();

        expect(result.storageAccessible).toBe(false);
        expect(result.lastError).toBe('Storage Error');
    });
});
