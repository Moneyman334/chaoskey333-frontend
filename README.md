# ChaosKey333 Frontend - Backup-Ready Checkout System

A unified payments interface with support for multiple providers, ensuring the ability to take payments the moment any provider is cleared for use.

## Features

- **Multiple Payment Providers**: Stripe, Coinbase Commerce, and PayPal Checkout
- **Adapter Pattern**: Unified interface for all payment providers
- **Environment Configuration**: Easy switching between providers via `PAYMENTS_PROVIDER` flag
- **Storefront**: Clean product page for the "Superman Unstoppable Relic"
- **Auto-Mint Integration**: Webhook-based payment confirmation with mint token generation
- **Success/Cancel Pages**: Complete checkout flow

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and configure your payment provider keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```bash
# Set your preferred payment provider (coinbase is default)
PAYMENTS_PROVIDER=coinbase

# Configure your chosen provider's API keys
COINBASE_COMMERCE_API_KEY=your_actual_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret

# Or for Stripe
# PAYMENTS_PROVIDER=stripe
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLIC_KEY=pk_live_...

# Or for PayPal
# PAYMENTS_PROVIDER=paypal
# PAYPAL_CLIENT_ID=your_client_id
# PAYPAL_CLIENT_SECRET=your_client_secret
```

### 3. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:5000`

## Payment Provider Configuration

### Default Provider: Coinbase Commerce

Coinbase Commerce is configured as the default payment provider while Stripe is under review.

To use Coinbase Commerce:
1. Create an account at [Coinbase Commerce](https://commerce.coinbase.com)
2. Get your API key from the dashboard
3. Set up webhook endpoints for payment confirmation

### Switching Providers

Change the `PAYMENTS_PROVIDER` environment variable to switch providers:

- `coinbase` - Coinbase Commerce (cryptocurrency payments)
- `stripe` - Stripe (credit card payments)
- `paypal` - PayPal (PayPal and credit card payments)

### Environment Variables

#### Core Configuration
- `PAYMENTS_PROVIDER` - Active payment provider (coinbase/stripe/paypal)
- `PRODUCT_NAME` - Product name (default: "Superman Unstoppable Relic")
- `PRODUCT_PRICE` - Price in cents (default: 3333 = $33.33)
- `PORT` - Server port (default: 5000)

#### Stripe Configuration
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLIC_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret

#### Coinbase Commerce Configuration
- `COINBASE_COMMERCE_API_KEY` - Coinbase Commerce API key
- `COINBASE_COMMERCE_WEBHOOK_SECRET` - Coinbase webhook secret

#### PayPal Configuration
- `PAYPAL_CLIENT_ID` - PayPal application client ID
- `PAYPAL_CLIENT_SECRET` - PayPal application client secret
- `PAYPAL_WEBHOOK_ID` - PayPal webhook ID

## API Endpoints

### Core Endpoints

- `GET /store` - Main storefront page
- `GET /store/success` - Payment success page
- `GET /store/cancel` - Payment cancellation page

### API Endpoints

- `POST /api/checkout/start` - Start checkout with any provider
- `POST /api/webhook/:provider` - Provider-specific webhook handlers
- `GET /api/payment-config` - Get current provider configuration

### Legacy Endpoints (for backward compatibility)

- `POST /api/create-checkout-session` - Legacy Stripe checkout
- `POST /api/webhook` - Legacy Stripe webhook
- `GET /config` - Legacy Stripe config

## Webhook Setup

### Coinbase Commerce
Set your webhook URL to: `https://yourdomain.com/api/webhook/coinbase`

### Stripe
Set your webhook URL to: `https://yourdomain.com/api/webhook/stripe`

### PayPal
Set your webhook URL to: `https://yourdomain.com/api/webhook/paypal`

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
NODE_ENV=production npm start
```

## Testing

### Test Payment Configuration
```bash
curl http://localhost:5000/api/payment-config
```

### Test Provider Switching
Change `PAYMENTS_PROVIDER` in `.env` and restart the server to test different providers.

## Architecture

### Payment Adapter Pattern

The system uses the adapter pattern to provide a unified interface for all payment providers:

```
PaymentProvider (Interface)
├── StripeProvider
├── CoinbaseProvider
└── PayPalProvider
```

### Checkout Flow

1. User selects product on storefront (`/store`)
2. Connects wallet (MetaMask, Coinbase Wallet, etc.)
3. Clicks "Buy Now" to start checkout
4. Redirected to payment provider checkout
5. After payment: redirected to success page (`/store/success`)
6. Webhook confirms payment and generates mint token
7. User can mint NFT directly from success page

## Security Notes

- Never commit actual API keys to version control
- Use environment variables for all sensitive configuration
- Verify webhook signatures for all providers
- Implement proper error handling and logging
- Use HTTPS in production

## Support

For issues with specific payment providers:
- **Stripe**: [Stripe Support](https://support.stripe.com)
- **Coinbase Commerce**: [Coinbase Commerce Help](https://help.coinbase.com/en/coinbase/getting-started-with-coinbase/coinbase-commerce)
- **PayPal**: [PayPal Developer Support](https://developer.paypal.com/support)