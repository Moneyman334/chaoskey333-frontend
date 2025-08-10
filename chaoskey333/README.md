
# ChaosKey333 Vault Store

A comprehensive checkout and minting system for the ChaosKey333 Vault Store, built with Next.js and thirdweb.

## Features

- 🛒 **Full Store Experience**: Product catalog with crypto and PayPal payments
- ✅ **Success Flow**: Cinematic success page with "Mint Now" and "Mint Later" options
- 🪙 **Minting System**: Complete claim validation and NFT minting flow
- 🔗 **Webhook Integration**: Coinbase Commerce and PayPal webhook handlers
- 🛠️ **Admin Dashboard**: KV storage management for orders and claims
- 📱 **Mobile Optimized**: Responsive design with sticky buy dock
- 🔐 **Security**: JWT token signing and signature verification

## Environment Variables

Set these in Vercel or your deployment platform:

### Base Configuration
```bash
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_TEMPLATE_CLIENT_ID="your_thirdweb_client_id"
```

### Coinbase Commerce
```bash
COINBASE_COMMERCE_API_KEY="your_coinbase_api_key"
COINBASE_COMMERCE_WEBHOOK_SECRET="your_coinbase_webhook_secret"
```

### PayPal
```bash
PAYPAL_MODE="sandbox"  # or "live" for production
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_SECRET="your_paypal_secret"
PAYPAL_WEBHOOK_ID="your_paypal_webhook_id"
```

### Claims and Admin
```bash
CLAIM_SIGNING_SECRET="your_secret_key_for_jwt"
TEMP_ADMIN_TOKEN="your_admin_dashboard_token"
```

### Vercel KV (Optional)
```bash
KV_REST_API_URL="your_kv_api_url"
KV_REST_API_TOKEN="your_kv_api_token"
```

## Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables in Vercel
4. Deploy: `vercel --prod --confirm --name=chaoskey333-casino`
5. Set up webhooks:
   - Coinbase: `https://YOURDOMAIN/api/coinbase-webhook`
   - PayPal: `https://YOURDOMAIN/api/paypal-webhook`

## API Endpoints

- `POST /api/create-order` - Create payment orders
- `POST /api/coinbase-webhook` - Handle Coinbase payments
- `POST /api/paypal-webhook` - Handle PayPal payments
- `POST /api/claims/check` - Validate claim tokens
- `POST /api/claims/consume` - Consume claims for minting
- `POST /api/claim-link` - Generate "Mint Later" links

## Pages

- `/` - Landing page
- `/store` - Product catalog
- `/store/success` - Payment success page
- `/store/cancel` - Payment cancellation page
- `/mint` - NFT minting interface
- `/admin/kv?token=TOKEN` - Admin dashboard

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Testing

1. Navigate to `/store` to test purchase flow
2. Use mock payment flows in development
3. Access admin dashboard at `/admin/kv?token=dev_admin_token_123`
4. Test claim validation with generated links

## License

MIT
