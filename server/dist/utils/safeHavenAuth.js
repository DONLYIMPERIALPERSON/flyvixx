"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeHavenAuth = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
// SafeHaven OAuth2 Configuration
const SAFEHAVEN_BASE_URL = process.env.SAFEHAVEN_BASE_URL || 'https://api.sandbox.safehavenmfb.com';
const SAFEHAVEN_CLIENT_ID = process.env.SAFEHAVEN_CLIENT_ID || process.env.NEXT_PUBLIC_SAFEHAVEN_CLIENT_ID || '';
// Read keys from files instead of environment variables for proper formatting
const privateKeyPath = path_1.default.join(__dirname, '../../privatekey.pem');
const certificatePath = path_1.default.join(__dirname, '../../publickey.cer');
let SAFEHAVEN_PRIVATE_KEY;
let SAFEHAVEN_CERTIFICATE;
try {
    SAFEHAVEN_PRIVATE_KEY = fs_1.default.readFileSync(privateKeyPath, 'utf8');
    console.log('Successfully read private key, length:', SAFEHAVEN_PRIVATE_KEY.length);
    console.log('Private key starts with:', SAFEHAVEN_PRIVATE_KEY.substring(0, 50) + '...');
}
catch (error) {
    console.error('Failed to read SafeHaven private key file:', error);
    SAFEHAVEN_PRIVATE_KEY = '';
}
try {
    SAFEHAVEN_CERTIFICATE = fs_1.default.readFileSync(certificatePath, 'utf8');
}
catch (error) {
    console.error('Failed to read SafeHaven certificate file:', error);
    SAFEHAVEN_CERTIFICATE = '';
}
class SafeHavenAuth {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }
    /**
     * Generate a new JWT client assertion for SafeHaven OAuth2
     */
    generateClientAssertion() {
        if (!SAFEHAVEN_PRIVATE_KEY) {
            throw new Error('SafeHaven OAuth2 credentials not configured');
        }
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: 'https://flyvixx.com',
            sub: '401c00a87530b9b4dec5f02f20e7f1bf',
            aud: 'https://api.sandbox.safehavenmfb.com',
            iat: now,
            exp: now + (40 * 60) // 40 minutes (SafeHaven requirement)
        };
        // Manual JWT creation using crypto module to bypass jsonwebtoken's key size restrictions
        const header = {
            alg: 'RS256',
            typ: 'JWT'
        };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const message = `${encodedHeader}.${encodedPayload}`;
        try {
            const sign = (0, crypto_1.createSign)('RSA-SHA256');
            sign.update(message);
            const signature = sign.sign(SAFEHAVEN_PRIVATE_KEY, 'base64url');
            return `${message}.${signature}`;
        }
        catch (error) {
            console.error('Manual JWT signing failed:', error.message);
            throw error;
        }
    }
    /**
     * Get a valid access token, generating a new one if necessary
     */
    async getAccessToken() {
        // Check if we have a valid token that hasn't expired
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        try {
            const clientAssertion = this.generateClientAssertion();
            console.log('Generated JWT:', clientAssertion);
            const response = await fetch(`${SAFEHAVEN_BASE_URL}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: SAFEHAVEN_CLIENT_ID,
                    client_assertion: clientAssertion,
                    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
                })
            });
            const data = await response.json();
            if (response.status === 201 && data.access_token) {
                // Store the token with expiry (assuming 40 minutes if not provided)
                const expiresIn = data.expires_in || (40 * 60); // Default to 40 minutes
                this.accessToken = data.access_token;
                this.tokenExpiry = Date.now() + (expiresIn * 1000);
                return data.access_token;
            }
            else {
                console.error('SafeHaven OAuth2 error:', data);
                throw new Error(`Failed to get access token: ${data.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            console.error('SafeHaven OAuth2 request failed:', error);
            throw error;
        }
    }
    /**
     * Make an authenticated request to SafeHaven API
     */
    async makeAuthenticatedRequest(url, options = {}) {
        const token = await this.getAccessToken();
        console.log(`Making SafeHaven API request to: ${url}`);
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        console.log(`SafeHaven API response status: ${response.status}, ok: ${response.ok}`);
        const data = await response.json();
        console.log(`SafeHaven API response data:`, JSON.stringify(data, null, 2));
        if (!response.ok) {
            console.log(`SafeHaven API error - response not ok`);
            throw new Error(`SafeHaven API error: ${data.message || response.statusText}`);
        }
        // Check if the response contains an error even with 200 status
        if (data && data.responseCode && data.responseCode !== '00') {
            console.log(`SafeHaven API error - responseCode is not 00: ${data.responseCode}`);
            throw new Error(`SafeHaven API error: ${data.responseMessage || 'Unknown error'}`);
        }
        console.log(`SafeHaven API request successful`);
        return data;
    }
    /**
     * Verify bank account details
     */
    async verifyBankAccount(bankCode, accountNumber) {
        return this.makeAuthenticatedRequest(`${SAFEHAVEN_BASE_URL}/transfers/name-enquiry`, {
            method: 'POST',
            headers: {
                'ClientID': SAFEHAVEN_CLIENT_ID
            },
            body: JSON.stringify({
                bankCode,
                accountNumber
            })
        });
    }
    /**
     * Create a virtual account for deposits
     */
    async createVirtualAccount(amount, externalReference) {
        const callbackUrl = process.env.SAFEHAVEN_CALLBACK_URL;
        const settlementBankCode = process.env.SAFEHAVEN_SETTLEMENT_BANK_CODE || '999240';
        const settlementAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT_NUMBER;
        if (!callbackUrl) {
            throw new Error('SafeHaven callback URL not configured');
        }
        if (!settlementAccountNumber) {
            throw new Error('SafeHaven settlement account not configured');
        }
        return this.makeAuthenticatedRequest(`${SAFEHAVEN_BASE_URL}/virtual-accounts`, {
            method: 'POST',
            headers: {
                'ClientID': SAFEHAVEN_CLIENT_ID
            },
            body: JSON.stringify({
                validFor: 900, // 15 minutes
                callbackUrl,
                settlementAccount: {
                    bankCode: settlementBankCode,
                    accountNumber: settlementAccountNumber
                },
                amountControl: 'Fixed', // Correct enum value as per SafeHaven docs
                amount: Math.round(amount), // Amount in NGN (not kobo)
                externalReference
            })
        });
    }
    /**
     * Initiate a bank transfer
     */
    async initiateTransfer(transferData) {
        return this.makeAuthenticatedRequest(`${SAFEHAVEN_BASE_URL}/transfers`, {
            method: 'POST',
            headers: {
                'ClientID': SAFEHAVEN_CLIENT_ID
            },
            body: JSON.stringify(transferData)
        });
    }
    /**
     * Clear cached token (useful for testing or forced refresh)
     */
    clearToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }
}
// Export singleton instance
exports.safeHavenAuth = new SafeHavenAuth();
exports.default = exports.safeHavenAuth;
//# sourceMappingURL=safeHavenAuth.js.map