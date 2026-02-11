import https from 'https';
import { AppDataSource } from '../config/database';
import { CryptoRate } from '../models/CryptoRate';
import { logger } from '../utils/logger';
import { DataSource, MoreThanOrEqual } from 'typeorm';

class CryptoService {
    private readonly BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price';
    private readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
    private readonly CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
    private dataSource: DataSource;

    constructor(dataSource?: DataSource) {
        this.dataSource = dataSource || AppDataSource;
    }

    private get cryptoRateRepository() {
        return this.dataSource.getRepository(CryptoRate);
    }

    /**
     * Fetch crypto rate from CoinGecko API (fallback)
     */
    private async fetchFromCoinGecko(symbol: string): Promise<number | null> {
        return new Promise((resolve) => {
            // Map Binance symbols to CoinGecko IDs
            const coinGeckoIds: { [key: string]: string } = {
                'BTCUSDT': 'bitcoin',
                'ETHUSDT': 'ethereum',
                'USDTUSDT': 'tether'
            };

            const coinId = coinGeckoIds[symbol];
            if (!coinId) {
                logger.warn(`No CoinGecko mapping found for symbol: ${symbol}`);
                resolve(null);
                return;
            }

            const url = `${this.COINGECKO_API_URL}?ids=${coinId}&vs_currencies=usd`;
            logger.info(`Fetching crypto rate from CoinGecko: ${url}`);

            const request = https.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Flyvixx-Crypto-Service/1.0'
                }
            }, (res) => {
                logger.info(`CoinGecko response status: ${res.statusCode}`);

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    logger.info(`CoinGecko raw response for ${symbol}:`, data.substring(0, 200));
                    try {
                        const response = JSON.parse(data);
                        if (response && response[coinId] && response[coinId].usd) {
                            const price = parseFloat(response[coinId].usd);
                            logger.info(`Successfully parsed ${symbol} price from CoinGecko: $${price}`);
                            resolve(price);
                        } else {
                            logger.error(`Invalid CoinGecko response structure for ${symbol}:`, response);
                            resolve(null);
                        }
                    } catch (error) {
                        logger.error(`Failed to parse CoinGecko response for ${symbol}:`, error);
                        logger.error(`Raw response data:`, data);
                        resolve(null);
                    }
                });
            });

            request.on('error', (error) => {
                logger.error(`Network error fetching ${symbol} rate from CoinGecko:`, {
                    code: (error as any).code,
                    message: error.message,
                    errno: (error as any).errno,
                    syscall: (error as any).syscall
                });
                resolve(null);
            });

            request.on('timeout', () => {
                request.destroy();
                logger.error(`Timeout (10s) fetching ${symbol} rate from CoinGecko`);
                resolve(null);
            });

            request.on('abort', () => {
                logger.error(`CoinGecko request aborted for ${symbol}`);
                resolve(null);
            });
        });
    }

    /**
     * Fetch crypto rate from Binance API (primary)
     */
    private async fetchFromBinance(symbol: string): Promise<number | null> {
        return new Promise((resolve) => {
            const url = `${this.BINANCE_API_URL}?symbol=${symbol}`;
            logger.info(`Fetching crypto rate from: ${url}`);

            const request = https.get(url, {
                timeout: 10000, // Increased timeout to 10 seconds
                headers: {
                    'User-Agent': 'Flyvixx-Crypto-Service/1.0'
                }
            }, (res) => {
                logger.info(`Binance response status: ${res.statusCode}`);
                logger.info(`Binance response headers:`, res.headers);

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    logger.info(`Binance raw response for ${symbol}:`, data.substring(0, 200));
                    try {
                        const response = JSON.parse(data);
                        if (response && response.price) {
                            const price = parseFloat(response.price);
                            logger.info(`Successfully parsed ${symbol} price: $${price}`);
                            resolve(price);
                        } else {
                            logger.error(`Invalid response structure for ${symbol}:`, response);
                            resolve(null);
                        }
                    } catch (error) {
                        logger.error(`Failed to parse Binance response for ${symbol}:`, error);
                        logger.error(`Raw response data:`, data);
                        resolve(null);
                    }
                });
            });

            request.on('error', (error) => {
                logger.error(`Network error fetching ${symbol} rate from Binance:`, {
                    code: (error as any).code,
                    message: error.message,
                    errno: (error as any).errno,
                    syscall: (error as any).syscall
                });
                resolve(null);
            });

            request.on('timeout', () => {
                request.destroy();
                logger.error(`Timeout (10s) fetching ${symbol} rate from Binance`);
                resolve(null);
            });

            request.on('abort', () => {
                logger.error(`Request aborted for ${symbol}`);
                resolve(null);
            });
        });
    }

    /**
     * Get crypto rate with caching
     */
    async getRate(symbol: string): Promise<{ price: number; timestamp: Date } | null> {
        try {
            // Check cache first
            const cacheTime = new Date(Date.now() - this.CACHE_DURATION);
            const cachedRate = await this.cryptoRateRepository.findOne({
                where: {
                    symbol,
                    timestamp: MoreThanOrEqual(cacheTime)
                },
                order: { timestamp: 'DESC' }
            });

            if (cachedRate) {
                return {
                    price: Number(cachedRate.price),
                    timestamp: cachedRate.timestamp
                };
            }

            // Fetch from Binance first, fallback to CoinGecko
            let price = await this.fetchFromBinance(symbol);
            let source = 'Binance';

            if (price === null) {
                logger.warn(`Binance failed for ${symbol}, trying CoinGecko fallback...`);
                price = await this.fetchFromCoinGecko(symbol);
                source = 'CoinGecko';
            }

            if (price === null) {
                // Return last known rate if available
                const lastRate = await this.cryptoRateRepository.findOne({
                    where: { symbol },
                    order: { timestamp: 'DESC' }
                });
                if (lastRate) {
                    logger.warn(`All APIs failed for ${symbol}, using cached rate: $${Number(lastRate.price)}`);
                    return {
                        price: Number(lastRate.price),
                        timestamp: lastRate.timestamp
                    };
                }
                logger.error(`All APIs failed for ${symbol} and no cached rate available`);
                return null;
            }

            logger.info(`✅ Successfully fetched ${symbol} rate from ${source}: $${price}`);

            // Save to cache - update existing or create new
            let rateToSave = await this.cryptoRateRepository.findOne({
                where: { symbol }
            });

            if (rateToSave) {
                // Update existing
                rateToSave.price = price;
                rateToSave.timestamp = new Date();
                await this.cryptoRateRepository.save(rateToSave);
            } else {
                // Create new
                rateToSave = new CryptoRate();
                rateToSave.symbol = symbol;
                rateToSave.price = price;
                rateToSave.timestamp = new Date();
                await this.cryptoRateRepository.save(rateToSave);
            }

            return {
                price,
                timestamp: rateToSave.timestamp
            };
        } catch (error) {
            logger.error(`Failed to get ${symbol} rate:`, error);
            return null;
        }
    }

    /**
     * Update rates for all supported symbols (called by cron job)
     */
    async updateRates(): Promise<void> {
        const symbols = ['BTCUSDT'];

        for (const symbol of symbols) {
            try {
                // Try Binance first, fallback to CoinGecko
                let price = await this.fetchFromBinance(symbol);
                let source = 'Binance';

                if (price === null) {
                    logger.warn(`Binance failed for ${symbol}, trying CoinGecko fallback...`);
                    price = await this.fetchFromCoinGecko(symbol);
                    source = 'CoinGecko';
                }

                if (price !== null) {
                    // Try to find existing rate
                    let existingRate = await this.cryptoRateRepository.findOne({
                        where: { symbol }
                    });

                    if (existingRate) {
                        // Update existing
                        existingRate.price = price;
                        existingRate.timestamp = new Date();
                        await this.cryptoRateRepository.save(existingRate);
                    } else {
                        // Create new
                        const newRate = new CryptoRate();
                        newRate.symbol = symbol;
                        newRate.price = price;
                        newRate.timestamp = new Date();
                        await this.cryptoRateRepository.save(newRate);
                    }

                    logger.info(`✅ Updated ${symbol} rate from ${source}: $${price}`);
                } else {
                    logger.error(`❌ Failed to update ${symbol} rate from both APIs`);
                }
            } catch (error) {
                logger.error(`Failed to update ${symbol} rate:`, error);
            }
        }
    }

    /**
     * Get all cached rates
     */
    async getAllRates(): Promise<Array<{ symbol: string; price: number; timestamp: Date }>> {
        try {
            const rates = await this.cryptoRateRepository.find({
                order: { timestamp: 'DESC' }
            });
            return rates.map(rate => ({
                symbol: rate.symbol,
                price: Number(rate.price),
                timestamp: rate.timestamp
            }));
        } catch (error) {
            logger.error('Failed to get all rates:', error);
            return [];
        }
    }
}

const cryptoService = new CryptoService();
export default cryptoService;
export { CryptoService };
