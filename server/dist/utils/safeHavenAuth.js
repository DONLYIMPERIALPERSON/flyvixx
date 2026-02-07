"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeHavenAuth = void 0;
const crypto_1 = require("crypto");
// SafeHaven OAuth2 Configuration
const SAFEHAVEN_BASE_URL = process.env.SAFEHAVEN_BASE_URL || 'https://api.safehavenmfb.com';
const SAFEHAVEN_CLIENT_ID = process.env.SAFEHAVEN_CLIENT_ID || '';
// Use the audience from ENV or derive it from the Base URL
const SAFEHAVEN_AUDIENCE = process.env.SAFEHAVEN_AUDIENCE || SAFEHAVEN_BASE_URL;
// Read keys from environment variables
const SAFEHAVEN_PRIVATE_KEY = (process.env.SAFEHAVEN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
class SafeHavenAuth {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }
    generateClientAssertion() {
        if (!SAFEHAVEN_PRIVATE_KEY || !SAFEHAVEN_CLIENT_ID) {
            throw new Error('SafeHaven OAuth2 credentials (Private Key or Client ID) missing in ENV');
        }
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: 'https://flyvixx.com',
            sub: SAFEHAVEN_CLIENT_ID, // Use the ID from .env
            aud: SAFEHAVEN_AUDIENCE, // Use the Audience from .env
            iat: now,
            exp: now + (40 * 60)
        };
        const header = { alg: 'RS256', typ: 'JWT' };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const message = `${encodedHeader}.${encodedPayload}`;
        try {
            const sign = (0, crypto_1.createSign)('RSA-SHA256');
            sign.update(message);
            // Ensure the private key is handled correctly as a string
            const signature = sign.sign(SAFEHAVEN_PRIVATE_KEY, 'base64url');
            return `${message}.${signature}`;
        }
        catch (error) {
            console.error('Manual JWT signing failed:', error.message);
            throw error;
        }
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        try {
            const clientAssertion = this.generateClientAssertion();
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
            if ((response.status === 200 || response.status === 201) && data.access_token) {
                const expiresIn = data.expires_in || (40 * 60);
                this.accessToken = data.access_token;
                this.tokenExpiry = Date.now() + (expiresIn * 1000);
                return data.access_token;
            }
            else {
                console.error('SafeHaven OAuth2 error details:', data);
                throw new Error(`SafeHaven OAuth2 failed: ${data.error_description || data.error || 'Unknown error'}`);
            }
        }
        catch (error) {
            console.error('SafeHaven OAuth2 request failed:', error);
            throw error;
        }
    }
    async makeAuthenticatedRequest(url, options = {}) {
        const token = await this.getAccessToken();
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ClientID': SAFEHAVEN_CLIENT_ID
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`SafeHaven API error (${response.status}): ${data.message || response.statusText}`);
        }
        if (data && data.responseCode && data.responseCode !== '00') {
            throw new Error(`SafeHaven Business Error: ${data.responseMessage || 'Unknown error'}`);
        }
        return data;
    }
    async verifyBankAccount(bankCode, accountNumber) {
        return this.makeAuthenticatedRequest(`${SAFEHAVEN_BASE_URL}/transfers/name-enquiry`, {
            method: 'POST',
            body: JSON.stringify({ bankCode, accountNumber })
        });
    }
    async createVirtualAccount(amount, externalReference) {
        const callbackUrl = process.env.SAFEHAVEN_CALLBACK_URL;
        const settlementBankCode = process.env.SAFEHAVEN_SETTLEMENT_BANK_CODE || '090286';
        const settlementAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT_NUMBER;
        if (!callbackUrl || !settlementAccountNumber) {
            throw new Error('SafeHaven configuration (Callback URL or Settlement Account) missing in ENV');
        }
        return this.makeAuthenticatedRequest(`${SAFEHAVEN_BASE_URL}/virtual-accounts`, {
            method: 'POST',
            body: JSON.stringify({
                validFor: 900,
                callbackUrl,
                settlementAccount: {
                    bankCode: settlementBankCode,
                    accountNumber: settlementAccountNumber
                },
                amountControl: 'Fixed',
                amount: Math.round(amount),
                externalReference
            })
        });
    }
    async initiateTransfer(transferData) {
        return this.makeAuthenticatedRequest(`${SAFEHAVEN_BASE_URL}/transfers`, {
            method: 'POST',
            body: JSON.stringify(transferData)
        });
    }
    clearToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
    }
}
exports.safeHavenAuth = new SafeHavenAuth();
exports.default = exports.safeHavenAuth;
//# sourceMappingURL=safeHavenAuth.js.map