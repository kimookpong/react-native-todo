export interface StockDataPoint {
    timestamp: number;
    price: number;
}

export interface StockMeta {
    symbol: string;
    regularMarketPrice: number;
    previousClose: number;
}

export const YahooFinanceService = {
    async getChartData(symbol: string, range: string = '1d', interval: string = '5m'): Promise<{ meta: StockMeta, data: StockDataPoint[] } | null> {
        try {
            // Unofficial Yahoo Finance API endpoint
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
            );

            if (!response.ok) {
                console.error('Yahoo Finance API Error:', response.statusText);
                return null;
            }

            const json = await response.json();
            const result = json.chart.result?.[0];

            if (!result) {
                return null;
            }

            const meta = result.meta;
            const timestamps = result.timestamp || [];
            const quotes = result.indicators.quote[0];
            const prices = quotes.close || [];

            const data: StockDataPoint[] = [];

            for (let i = 0; i < timestamps.length; i++) {
                if (prices[i] !== null && prices[i] !== undefined) {
                    data.push({
                        timestamp: timestamps[i],
                        price: prices[i]
                    });
                }
            }

            return {
                meta: {
                    symbol: meta.symbol,
                    regularMarketPrice: meta.regularMarketPrice,
                    previousClose: meta.chartPreviousClose || meta.previousClose
                },
                data
            };

        } catch (error) {
            console.error('Error fetching stock data:', error);
            return null;
        }
    }
};
