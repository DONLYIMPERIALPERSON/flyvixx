import express from 'express';
import cryptoService from '../services/cryptoService';
import { validateDescopeToken } from '../middleware/descopeAuth';

const router = express.Router();

/**
 * Get crypto rate
 * GET /api/crypto/rate?symbol=BTCUSDT
 */
router.get('/rate', validateDescopeToken, async (req, res) => {
    try {
        const { symbol } = req.query;

        if (!symbol || typeof symbol !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Symbol parameter is required'
            });
        }

        const rate = await cryptoService.getRate(symbol);

        if (!rate) {
            return res.status(404).json({
                success: false,
                error: 'Rate not available'
            });
        }

        res.json({
            success: true,
            rate: {
                symbol,
                price: rate.price,
                timestamp: rate.timestamp
            }
        });
    } catch (error) {
        console.error('Error fetching crypto rate:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Get all cached rates
 * GET /api/crypto/rates
 */
router.get('/rates', validateDescopeToken, async (req, res) => {
    try {
        const rates = await cryptoService.getAllRates();

        res.json({
            success: true,
            rates
        });
    } catch (error) {
        console.error('Error fetching crypto rates:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Get crypto deposit details
 * POST /api/crypto/deposit-details
 */
router.post('/deposit-details', validateDescopeToken, async (req, res) => {
    try {
        const { usdAmount, cryptoType } = req.body;

        if (!usdAmount || typeof usdAmount !== 'number' || usdAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid USD amount is required'
            });
        }

        if (!cryptoType || !['btc', 'usdt'].includes(cryptoType.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Valid crypto type (btc or usdt) is required'
            });
        }

        const type = cryptoType.toLowerCase();

        let cryptoAmount: number;
        let walletAddress: string | undefined;
        let qrCodeUrl: string;

        if (type === 'btc') {
            // Get fresh BTC rate
            const rate = await cryptoService.getRate('BTCUSDT');
            if (!rate) {
                return res.status(500).json({
                    success: false,
                    error: 'BTC rate not available'
                });
            }

            cryptoAmount = usdAmount / rate.price;
            walletAddress = process.env.BTC_WALLET_ADDRESS;

            if (!walletAddress) {
                console.log('BTC_WALLET_ADDRESS not found in env:', process.env.BTC_WALLET_ADDRESS);
                console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('BTC') || key.includes('USDT')));
                return res.status(500).json({
                    success: false,
                    error: 'BTC wallet address not configured'
                });
            }

            qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${walletAddress}?amount=${cryptoAmount.toFixed(8)}`;
        } else {
            // USDT has fixed 1:1 rate
            cryptoAmount = usdAmount;
            walletAddress = process.env.USDT_WALLET_ADDRESS;

            if (!walletAddress) {
                console.log('USDT_WALLET_ADDRESS not found in env:', process.env.USDT_WALLET_ADDRESS);
                console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('BTC') || key.includes('USDT')));
                return res.status(500).json({
                    success: false,
                    error: 'USDT wallet address not configured'
                });
            }

            qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}?amount=${cryptoAmount.toFixed(2)}`;
        }

        // Set expiration to 3 hours from now
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 3);

        res.json({
            success: true,
            data: {
                walletAddress,
                cryptoAmount,
                usdAmount,
                cryptoType: type,
                qrCodeUrl,
                expirationTime: expirationTime.toISOString()
            }
        });
    } catch (error) {
        console.error('Error generating crypto deposit details:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * Update rates (admin only)
 * POST /api/crypto/update-rates
 */
router.post('/update-rates', validateDescopeToken, async (req, res) => {
    try {
        // TODO: Add admin check here
        await cryptoService.updateRates();

        res.json({
            success: true,
            message: 'Rates updated successfully'
        });
    } catch (error) {
        console.error('Error updating crypto rates:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
