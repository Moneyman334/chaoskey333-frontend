# Environment Variables Configuration for Superman Relic Auto-Mint Flow

Copy the following environment variables to your `.env.local` file in the `chaoskey333` directory:

```env
# Thirdweb Configuration
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id_here

# Payment Provider Configuration
NEXT_PUBLIC_PRIMARY_PAYMENT_PROVIDER=coinbase
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=your_coinbase_commerce_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id

# Server-side Payment Secrets
COINBASE_COMMERCE_WEBHOOK_SECRET=your_coinbase_webhook_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Vercel KV Configuration
KV_URL=your_vercel_kv_url
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_vercel_kv_read_only_token

# Security Configuration
HMAC_SECRET_KEY=generate_secure_random_string_here
CLAIM_TOKEN_EXPIRY_HOURS=24

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_on_sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
SERVER_SIGNER_ENABLED=false

# Admin Authentication
ADMIN_SECRET_KEY=generate_secure_admin_key_here

# Environment Mode
NEXT_PUBLIC_ENVIRONMENT=sandbox
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Instructions:

1. **Thirdweb**: Get your client ID from https://portal.thirdweb.com/
2. **Coinbase Commerce**: Create an account at https://commerce.coinbase.com/ (sandbox mode)
3. **Stripe**: Use test keys from https://dashboard.stripe.com/test/dashboard
4. **Vercel KV**: Set up a KV database at https://vercel.com/dashboard
5. **Contract**: Deploy your NFT contract to Sepolia testnet
6. **Security Keys**: Generate secure random strings for HMAC and admin keys

## Testing the Flow:

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000
3. Click "Buy Superman Relic" 
4. Test payment flow with sandbox credentials
5. Test minting with connected wallet
6. Test magic links for wallet-less users
7. Access admin panel at http://localhost:3000/admin/orders with your admin key

## Production Deployment:

1. Update environment variables in Vercel dashboard
2. Set webhook URLs for payment providers
3. Switch to production payment provider credentials
4. Deploy contract to mainnet (if desired)