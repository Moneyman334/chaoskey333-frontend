
# ChaosKey333 Casino - Frontend

A Next.js application for selling legendary relics and artifacts with integrated crypto payment processing.

## Features

- **ProductCard Component**: Displays product details with inline checkout functionality
- **Store Grid**: Responsive product listing with neon graffiti chaos theme
- **Unified BuyButton**: Consistent checkout experience across products
- **Multiple Payment Providers**: Supports Coinbase Commerce and PayPal
- **Responsive Design**: Mobile-first design that adapts to all screen sizes

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following variables:

```bash
# ThirdWeb Configuration
NEXT_PUBLIC_TEMPLATE_CLIENT_ID="your_thirdweb_client_id"

# Base URL
NEXT_PUBLIC_BASE_URL="your_base_url"

# Product Configuration
NEXT_PUBLIC_PRODUCT_ID="chaos_relic_001"
NEXT_PUBLIC_PRODUCT_NAME="Legendary Family Relic"
NEXT_PUBLIC_PRODUCT_PRICE_USD="50"

# Payment Provider Configuration
NEXT_PUBLIC_PAYMENTS_PROVIDER="coinbase"  # or "paypal"

# Coinbase Commerce Configuration
COINBASE_COMMERCE_API_KEY="your_coinbase_api_key"
COINBASE_COMMERCE_WEBHOOK_SECRET="your_coinbase_webhook_secret"

# PayPal Configuration
PAYPAL_MODE="sandbox"  # or "production"
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment Instructions

### 1. Add Environment Variables to Vercel

```bash
vercel env add NEXT_PUBLIC_BASE_URL "sandbox"
# Add other environment variables as needed
```

### 2. Deploy to Production

```bash
vercel --prod --confirm --name=chaoskey333-casino
```

### 3. Test the Store

Visit `/store` to see the product grid and test the checkout functionality.

## Project Structure

```
src/
├── app/
│   ├── api/placeholder/         # Dynamic placeholder images
│   ├── store/                   # Store page with product grid
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles with neon theme
├── components/
│   ├── BuyButton.tsx           # Unified checkout button
│   └── ProductCard.tsx         # Product display component
```

## Payment Integration

The app supports multiple payment providers:

- **Coinbase Commerce**: Primary crypto payment processor
- **PayPal**: Backup traditional payment processor

The payment provider is configurable via the `NEXT_PUBLIC_PAYMENTS_PROVIDER` environment variable.

## Styling

The app features a VIP-style neon graffiti chaos theme with:
- Gradient backgrounds and borders
- Neon glow effects
- Animated particles
- Responsive grid layouts
- Cyberpunk color scheme
