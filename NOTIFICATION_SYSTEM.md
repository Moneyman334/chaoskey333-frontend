# ChaosKey333 Multi-Language Notification System

This system provides comprehensive multi-language email and SMS notifications for the ChaosKey333 Vault Store, ensuring a seamless global experience for NFT purchases.

## 🌟 Features

### Multi-Language Support
- **10 Languages**: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Mandarin, Arabic
- **Smart Detection**: Automatically detects buyer's language from checkout metadata, browser settings, or country
- **Fallback**: Defaults to English if language cannot be determined

### Email Notifications (Resend)
- 🎨 **ChaosKey333 Branded Design**: Beautiful HTML templates with gradient backgrounds
- 📱 **Responsive Layout**: Works on all devices and email clients
- 🔗 **QR Code Integration**: Embedded QR codes for easy mobile access
- 📧 **Plain Text Fallback**: Alternative text version for legacy email clients
- 🎯 **Localized Content**: Subject, body, and CTA buttons in buyer's language

### SMS Notifications (Twilio)
- 📱 **Concise Messages**: Short, hype-focused text optimized for SMS
- 🌍 **International Support**: Proper phone number formatting for global delivery
- 🔗 **Quick Access**: Direct mint links and QR alternatives
- 💬 **Language-Specific**: Messages translated to buyer's preferred language

### Security Features
- 🔐 **Unique Claim Tokens**: Each buyer gets a unique, secure token
- ⏰ **48-Hour Expiration**: Links automatically expire for security
- 🚫 **Single-Use Tokens**: Prevents replay attacks and duplicate claims
- 🗄️ **Vercel KV Storage**: Secure, fast token storage and validation

### Admin Tools
- 📊 **Send Analytics**: View all sent emails and SMS at `/admin/sends`
- 🔄 **Resend Functionality**: Retry failed notifications
- 📈 **Delivery Status**: Track success/failure rates
- 🔍 **Search & Filter**: Find specific notifications by wallet, email, or date

## 🚀 Quick Start

### 1. Environment Variables

Add these to your Vercel project:

```bash
# Core Application
NEXT_PUBLIC_BASE_URL=https://chaoskey333-casino.vercel.app

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Enable/Disable Services
ENABLE_EMAIL=true
ENABLE_SMS=true

# Vercel KV (automatically configured)
KV_REST_API_URL=auto
KV_REST_API_TOKEN=auto
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod --confirm --name=chaoskey333-casino
```

### 3. Test the System

```bash
# Run local tests
node test-notifications.js

# Test notification endpoint
curl -X POST https://your-domain.vercel.app/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"language": "es"}'
```

## 📋 API Reference

### Webhook Integration

The system automatically integrates with Stripe webhooks. When a `checkout.session.completed` event is received:

1. **Language Detection**: Analyzes buyer's metadata and browser settings
2. **Token Generation**: Creates secure claim token with 48-hour expiration
3. **Notifications**: Sends email and/or SMS in detected language
4. **Storage**: Records all notifications for admin review

### Admin Endpoints

#### View Sent Notifications
```
GET /admin/sends?limit=50&offset=0
```

#### Resend Failed Notification
```
POST /admin/resend/:recordId
```

#### Mint Page
```
GET /mint?token=claim_token_here
```

#### Process Mint
```
POST /api/mint
{
  "token": "claim_token_here"
}
```

## 🔧 Configuration

### Language Configuration

Languages are defined in `/config/languages.json`:

```json
{
  "supported": [
    {"code": "en", "name": "English", "default": true},
    {"code": "es", "name": "Spanish"},
    // ... more languages
  ]
}
```

### Translation System

Translations are stored in `/config/translations.json`:

```json
{
  "email": {
    "subject": {
      "en": "🔥 Your ChaosKey333 Relic is Ready to Mint!",
      "es": "🔥 ¡Tu Reliquia ChaosKey333 está Lista para Acuñar!"
    }
  },
  "sms": {
    "message": {
      "en": "🔥 Your {productName} is ready! Mint now: {link}"
    }
  }
}
```

### Environment Toggles

Control which notifications are sent:

- `ENABLE_EMAIL=false`: Disables all email notifications
- `ENABLE_SMS=false`: Disables all SMS notifications

## 🧪 Testing

### Language Detection Tests
```bash
node test-notifications.js
```

### Manual Testing
1. Create a test checkout session with metadata
2. Complete payment to trigger webhook
3. Check `/admin/sends` for notification records
4. Use mint link from email/SMS

### Test Specific Languages
```bash
curl -X POST /api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"language": "ja"}'
```

## 🔐 Security

### Token Security
- **Unique UUIDs**: Each token is a cryptographically secure UUID
- **Time-Limited**: All tokens expire after 48 hours
- **Single-Use**: Tokens are invalidated after successful mint
- **Secure Storage**: Tokens stored in Vercel KV with automatic cleanup

### Data Protection
- **No PII Storage**: Personal data is not permanently stored
- **Encrypted Transit**: All API calls use HTTPS
- **Minimal Exposure**: Tokens contain only necessary mint data

## 🌍 Internationalization

### Supported Languages

| Code | Language | Sample Region |
|------|----------|---------------|
| `en` | English | US, UK, AU |
| `es` | Spanish | ES, MX, AR |
| `fr` | French | FR, CA, BE |
| `de` | German | DE, AT |
| `it` | Italian | IT |
| `pt` | Portuguese | PT, BR |
| `ja` | Japanese | JP |
| `ko` | Korean | KR |
| `zh` | Mandarin | CN, TW, HK |
| `ar` | Arabic | SA, AE, EG |

### Language Detection Priority

1. **Explicit Metadata**: `checkoutMetadata.language`
2. **Browser Headers**: `Accept-Language` header
3. **Country Mapping**: Country code to language mapping
4. **Default Fallback**: English (`en`)

### Adding New Languages

1. Add language to `/config/languages.json`
2. Add translations to `/config/translations.json`
3. Update country mapping in `services/languageService.js`
4. Test with `node test-notifications.js`

## 🚨 Troubleshooting

### Common Issues

**Emails not sending**
- Check `RESEND_API_KEY` is configured
- Verify domain is verified in Resend dashboard
- Check `/admin/sends` for error details

**SMS not sending**
- Verify Twilio credentials are correct
- Check phone number formatting (+1234567890)
- Ensure Twilio account has sufficient balance

**Tokens not working**
- Verify Vercel KV is properly configured
- Check token hasn't expired (48 hours)
- Ensure token hasn't been used already

**Language detection issues**
- Check browser sends proper `Accept-Language` headers
- Verify country code detection
- Add explicit `language` to checkout metadata

### Debug Mode

Enable detailed logging:
```bash
DEBUG=chaoskey333:* node server.js
```

### Health Check

Check system status:
```bash
curl https://your-domain.vercel.app/health
```

## 📈 Monitoring

### Key Metrics
- Email delivery rate
- SMS delivery rate
- Token usage rate
- Language distribution
- Error rates by service

### Log Analysis
All notifications are logged with:
- Timestamp
- Recipient details
- Language used
- Delivery status
- Error details (if any)

## 🤝 Contributing

### Adding Features
1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Test with multiple languages

### Code Structure
```
services/
├── languageService.js    # Language detection & translation
├── tokenService.js       # Token management & KV storage
├── emailService.js       # Resend email integration
├── smsService.js         # Twilio SMS integration
└── notificationService.js # Coordination layer

config/
├── languages.json        # Supported languages
└── translations.json     # Translation dictionary
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues or questions:
- Create GitHub issue
- Email: support@chaoskey333.com
- Check `/admin/sends` for notification status