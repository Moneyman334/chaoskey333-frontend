# Coinbase Commerce Integration - Setup Guide

## Overview
This implementation adds Coinbase Commerce payment integration to the ChaosKey333 frontend, allowing users to purchase the Superman Relic NFT using cryptocurrency.

## Features Implemented

### 1. API Endpoints
- **POST `/api/commerce/create-charge`** - Creates a new Coinbase Commerce charge
- **POST `/api/commerce/webhook`** - Handles Coinbase Commerce webhook events

### 2. Components
- **BuyButton** - React component that integrates Coinbase Commerce checkout
- **Success Page** - `/store/success` - Displays payment confirmation
- **Cancel Page** - `/store/cancel` - Handles payment cancellation

### 3. Default Configuration
- Currency: USD
- Amount: $19.99
- Product: Superman Relic
- Metadata: Includes wallet address for minting
- "Mint Later" tokens: Enabled by default

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Coinbase Commerce Configuration
COINBASE_API_KEY=your_coinbase_commerce_api_key_here
COINBASE_WEBHOOK_SECRET=your_coinbase_webhook_secret_here
```

### 2. Coinbase Commerce Account Setup
1. Create account at [commerce.coinbase.com](https://commerce.coinbase.com)
2. Get API key from Settings > API keys
3. Set up webhook endpoint pointing to `your-domain.com/api/commerce/webhook`
4. Copy webhook secret from webhook settings

### 3. Frontend Configuration
The BuyButton component automatically:
- Connects to user's wallet
- Includes wallet address in payment metadata
- Redirects to Coinbase Commerce checkout
- Handles success/error states

## Usage

### Basic Implementation
```jsx
import BuyButton from './components/BuyButton';

<BuyButton 
  amount="19.99"
  currency="USD"
  productName="Superman Relic"
  onSuccess={(charge) => console.log('Success:', charge)}
  onError={(error) => console.log('Error:', error)}
/>
```

### Webhook Events
The system handles these Coinbase Commerce webhook events:
- `charge:confirmed` - Payment successful, queues minting
- `charge:failed` - Payment failed
- `charge:delayed` - Payment delayed

## Architecture

```
Frontend (Next.js) → Express Server → Coinbase Commerce API
                         ↓
                    Webhook Handler → Minting Queue
```

## Testing

### 1. Start Development Server
```bash
npm start
```

### 2. Test API Endpoint
```bash
curl -X POST http://localhost:5000/api/commerce/create-charge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234567890abcdef"}'
```

### 3. Build Frontend
```bash
cd chaoskey333
npm run build
```

## Security Features

- Webhook signature verification
- Wallet address validation
- Environment variable protection
- Error handling for missing configuration

## Deployment Checklist

- [ ] Set production Coinbase Commerce API keys
- [ ] Configure webhook URL in Coinbase Commerce dashboard
- [ ] Test payment flow end-to-end
- [ ] Verify webhook processing
- [ ] Test success/cancel page redirects

## Support

For issues with Coinbase Commerce integration:
1. Check environment variables are set correctly
2. Verify webhook URL is accessible
3. Check server logs for error details
4. Ensure wallet is connected before payment