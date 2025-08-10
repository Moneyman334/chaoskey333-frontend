# ChaosKey333 PayPal Prime Vault Integration

## Environment Variables Required

Add these environment variables to your `.env` file or deployment environment:

### PayPal Configuration
```
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_ENVIRONMENT=sandbox  # Use 'live' for production
```

### Existing Stripe Configuration
```
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## PayPal Developer Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Create a new app or use existing app
3. Copy the Client ID and Client Secret
4. Set the environment to 'sandbox' for testing or 'live' for production

## Features Implemented

### ✅ One-Click Vault Checkout
- PayPal Prime auto-detected as default payment gateway
- Streamlined payment button integration
- Direct link to relic claim flow

### ✅ Dual-Gateway Mode  
- PayPal Prime and Stripe side-by-side options
- Users can choose preferred gateway
- No need to leave vault environment

### ✅ Auto-Mint Trigger
- Automatic NFT minting on successful PayPal payment
- Wallet connection prompt if not linked
- Uses existing vault minting engine

### ✅ Prime Buyer Badge
- Exclusive "Prime Vault Key" holographic badge
- Displays for PayPal Prime users only
- Animated shimmer effect

### ✅ Revenue Pulse Tracker
- Real-time logging of all PayPal transactions
- Dashboard shows transaction stats
- Separate tracking for Prime vs Standard transactions
- Auto-refresh every 30 seconds

## API Endpoints Added

### `/config`
- Returns both Stripe and PayPal configuration
- Indicates which gateways are available

### `/api/paypal/create-order`
- Creates PayPal order for vault purchase
- Includes wallet address in order metadata

### `/api/paypal/capture-order`
- Captures completed PayPal payment
- Triggers Prime Badge assignment
- Logs to Revenue Pulse Tracker

### `/api/pulse-tracker`
- Returns transaction statistics
- Supports filtering by gateway type
- Provides real-time sales data

## Files Modified/Created

### Backend (server.js)
- Added PayPal SDK integration
- Enhanced config endpoint
- Added PayPal order creation/capture
- Implemented Revenue Pulse Tracker
- Updated Stripe integration for consistency

### Frontend (public/vault.html)
- Complete UI overhaul with dual-gateway support
- PayPal buttons integration
- Prime Badge display system
- Auto-mint functionality
- Real-time pulse tracker display

### Testing (test-paypal-prime.html)
- Comprehensive test interface
- Gateway connection testing
- Pulse tracker verification

## Usage

1. Set up PayPal Developer account and get credentials
2. Add environment variables
3. Deploy updated code
4. Test using test-paypal-prime.html
5. Users can access enhanced vault at /public/vault.html

## Prime Badge System

PayPal Prime users receive:
- Exclusive holographic badge animation
- "PRIME VAULT KEY HOLDER" status
- Enhanced transaction logging with "PRIME_SURGE" intensity
- Priority status in vault leaderboard (ready for future implementation)

## Security Notes

- PayPal Client Secret is server-side only
- Wallet addresses are validated before order creation
- Transaction metadata includes wallet verification
- Revenue tracking is secured on backend