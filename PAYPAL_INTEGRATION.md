# ChaosKey333 Frontend - PayPal Integration

This repository now includes PayPal Smart Button integration alongside the existing Stripe payment system, implementing a secure claim token system for gated NFT minting.

## 🚀 New Features Added

### 1. PayPal Smart Button Integration
- **Inline Checkout**: PayPal Smart Buttons embedded directly into product pages
- **Real-time Processing**: Instant payment capture and claim token generation
- **Cosmic Theme**: PayPal buttons styled to match the existing neon/cosmic design
- **Fallback Support**: Graceful handling when PayPal is not configured

### 2. Claim Token System
- **Secure Tokens**: Cryptographically secure claim tokens generated on payment success
- **One-time Use**: Tokens are automatically marked as used after minting
- **Traceability**: Full payment and minting history tracked with timestamps
- **Multiple Providers**: Supports both Stripe and PayPal payment sources

### 3. Gated Mint UI (`/store/success`)
- **Token Validation**: Automatic claim token validation from URL parameters
- **Wallet Integration**: Seamless wallet connection for minting
- **Status Tracking**: Real-time status updates throughout the mint process
- **Security**: Prevents duplicate minting and unauthorized access

### 4. Webhook Support
- **PayPal Webhooks**: Handles `PAYMENT.CAPTURE.COMPLETED` events
- **Security Headers**: Validates PayPal webhook authenticity (transmission_id, cert_url, transmission_sig)
- **Automatic Token Generation**: Creates claim tokens for webhook-triggered payments

### 5. Vault Broadcast Pulse (Optional)
- **Real-time Updates**: Triggers vault UI updates on successful minting
- **Visual Effects**: Cosmic animations and lighting effects
- **WebSocket Ready**: Infrastructure prepared for real-time vault communications

## 🛠️ Setup Instructions

### Environment Variables

Add the following to your `.env` file:

```bash
# Stripe Configuration (existing)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal Configuration (new)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Other Configuration
PRIVATE_KEY=your_wallet_private_key_without_0x
```

### PayPal Setup

1. **Create PayPal App**:
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Create a new app for your project
   - Get your Client ID and Client Secret

2. **Configure Webhooks**:
   - Add webhook endpoint: `https://yourdomain.com/api/paypal-webhook`
   - Subscribe to event: `PAYMENT.CAPTURE.COMPLETED`
   - Configure webhook security settings

3. **Test Integration**:
   - Visit `/test-paypal` for comprehensive integration testing
   - Use PayPal sandbox for development testing

## 🧪 Testing

### Test Pages Available

1. **`/test-paypal`** - Comprehensive PayPal integration test suite
   - Wallet connection testing
   - PayPal Smart Button functionality
   - Claim token generation and validation
   - Complete payment to mint flow

2. **`/store/success`** - Gated mint interface
   - Token validation
   - Wallet connection
   - NFT minting process

3. **`/test-wallet-stripe.html`** - Original Stripe integration tests

### Test Flow

1. **Connect Wallet**: MetaMask or Coinbase Wallet
2. **Test Payment**: Use PayPal Smart Button (sandbox mode)
3. **Generate Token**: Payment creates secure claim token
4. **Validate Token**: Check token status and metadata
5. **Mint NFT**: Use token to mint relic to wallet
6. **Verify Completion**: Confirm token marked as used

## 📡 API Endpoints

### PayPal Integration
- `POST /api/paypal-capture` - Process PayPal payment capture
- `POST /api/paypal-webhook` - Handle PayPal webhook events

### Claim Token System
- `POST /api/validate-claim-token` - Validate claim token status
- `POST /api/mint-with-token` - Mint NFT using claim token

### Configuration
- `GET /config` - Get public API keys (Stripe + PayPal)

### Testing
- `GET /api/test-all` - Comprehensive system status check

## 🔐 Security Features

### PayPal Webhook Validation
- **Transmission ID**: Validates webhook authenticity
- **Certificate URL**: Verifies PayPal certificate source
- **Transmission Signature**: Cryptographic signature verification
- **Timestamp Validation**: Ensures webhook freshness

### Claim Token Security
- **Cryptographic Generation**: 32-byte random tokens
- **One-time Use**: Automatic invalidation after minting
- **Expiration Tracking**: Timestamp-based token lifecycle
- **Metadata Binding**: Tokens tied to specific wallet addresses

## 🎨 UI/UX Features

### Cosmic Theme Integration
- **Neon Glow Effects**: PayPal buttons with cosmic glow
- **Gradient Styling**: Matching color schemes across payment options
- **Hover Animations**: Ripple effects and transforms
- **Loading States**: Animated status indicators

### Responsive Design
- **Mobile Optimized**: Smart Button layout adaptation
- **Cross-browser**: Tested across major browsers
- **Accessibility**: ARIA labels and keyboard navigation

## 🚢 Deployment

### Production Checklist

1. **Environment Variables**: Set all required API keys
2. **Webhook URLs**: Configure PayPal webhooks for production domain
3. **SSL Certificate**: Ensure HTTPS for PayPal integration
4. **Database Migration**: Replace in-memory token storage with persistent database
5. **Error Monitoring**: Set up logging and error tracking
6. **Rate Limiting**: Implement API rate limits for security

### Development vs Production

- **Development**: Uses placeholder client IDs and sandbox mode
- **Production**: Requires live PayPal credentials and webhook setup
- **Testing**: Comprehensive test suite available at `/test-paypal`

## 📊 Monitoring

### Key Metrics
- Payment success rates (Stripe vs PayPal)
- Claim token generation and usage
- Mint completion rates
- Wallet connection success

### Logging
- All payment events logged with timestamps
- Webhook security validation results
- Token lifecycle tracking
- Error rates and failure modes

## 🔧 Technical Architecture

### Payment Flow
```
User → Connect Wallet → Choose Payment Method → Complete Payment → 
Generate Claim Token → Redirect to /store/success → Validate Token → 
Connect Wallet → Mint NFT → Mark Token as Used → Complete
```

### File Structure
```
├── server.js                    # Main server with PayPal endpoints
├── script.js                    # Frontend PayPal Smart Button logic
├── index.html                   # Main page with payment options
├── store/success.html           # Gated mint interface
├── test-paypal-integration.html # Comprehensive test suite
└── style.css                    # Cosmic theme styling
```

## 🤝 Contributing

When adding new payment providers or features:

1. Follow the existing pattern for claim token generation
2. Maintain cosmic theme consistency
3. Add comprehensive test coverage
4. Update documentation and environment variable examples
5. Implement security best practices for webhook validation

## 📝 License

This project maintains the same license as the original ChaosKey333 frontend repository.