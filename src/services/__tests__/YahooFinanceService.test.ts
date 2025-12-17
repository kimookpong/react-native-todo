import { YahooFinanceService } from '../YahooFinanceService';

// Mock global fetch
global.fetch = jest.fn();

describe('YahooFinanceService', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('should fetch and parse stock data correctly', async () => {
        const mockResponse = {
            chart: {
                result: [{
                    meta: {
                        symbol: 'AAPL',
                        regularMarketPrice: 150.00,
                        previousClose: 145.00
                    },
                    timestamp: [1620000000, 1620003600],
                    indicators: {
                        quote: [{
                            close: [150.00, 151.00]
                        }]
                    }
                }]
            }
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await YahooFinanceService.getChartData('AAPL');

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('https://query1.finance.yahoo.com/v8/finance/chart/AAPL'));
        expect(result).not.toBeNull();
        expect(result?.meta.symbol).toBe('AAPL');
        expect(result?.data.length).toBe(2);
        expect(result?.data[0].price).toBe(150.00);
    });

    it('should handle API errors gracefully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found'
        });

        const result = await YahooFinanceService.getChartData('INVALID');
        expect(result).toBeNull();
    });
});
