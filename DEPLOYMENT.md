# 🚀 ChaosKey333 Multi-Language Notifications - Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup
Configure these in your Vercel dashboard:

```bash
# Required for notifications
NEXT_PUBLIC_BASE_URL=https://chaoskey333-casino.vercel.app
RESEND_API_KEY=re_your_resend_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here  
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Control notification types
ENABLE_EMAIL=true
ENABLE_SMS=true

# Vercel KV (auto-configured)
KV_REST_API_URL=auto
KV_REST_API_TOKEN=auto
```

### 2. Service Configuration

#### Resend Setup:
1. Create account at [resend.com](https://resend.com)
2. Verify your domain (e.g., chaoskey333.com)
3. Generate API key
4. Add to Vercel environment variables

#### Twilio Setup:
1. Create account at [twilio.com](https://twilio.com)
2. Purchase a phone number
3. Get Account SID and Auth Token
4. Add to Vercel environment variables

#### Vercel KV Setup:
1. Enable Vercel KV in project settings
2. Environment variables auto-configured

### 3. Deployment Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod --confirm --name=chaoskey333-casino

# Set environment variables (alternative to dashboard)
vercel env add RESEND_API_KEY production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_PHONE_NUMBER production
vercel env add NEXT_PUBLIC_BASE_URL production
```

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://chaoskey333-casino.vercel.app/health
# Expected: "✅ Server is alive and kickin'"
```

### 2. Configuration Check
```bash
curl https://chaoskey333-casino.vercel.app/admin/sends
# Check "ready" status for email and SMS services
```

### 3. Admin Dashboard
Visit: `https://chaoskey333-casino.vercel.app/admin`
- Verify system configuration shows green checkmarks
- Check that base URL is correct

### 4. Test Notification (Development)
```bash
curl -X POST https://chaoskey333-casino.vercel.app/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"language": "es"}'
```

### 5. End-to-End Test
1. Create a Stripe checkout session
2. Complete payment
3. Check email/SMS delivery
4. Verify mint page works
5. Check admin dashboard shows notification record

## 🔧 Troubleshooting

### Common Issues:

**"Email not sending"**
- Check Resend API key is correct
- Verify domain is verified in Resend
- Check `/admin/sends` for error details

**"SMS not sending"**
- Verify Twilio credentials
- Check phone number format (+1234567890)
- Ensure Twilio account has balance

**"Tokens not working"**
- Verify Vercel KV is enabled
- Check token hasn't expired (48 hours)
- Ensure token hasn't been used already

**"Wrong language detected"**
- Add explicit language to Stripe metadata
- Check browser Accept-Language headers
- Verify country code mapping

### Debug Commands:

```bash
# Check system status
curl https://your-domain.vercel.app/api/test-all

# View notification logs
curl https://your-domain.vercel.app/admin/sends

# Test specific language
curl -X POST https://your-domain.vercel.app/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"language": "ja"}'
```

## 📊 Monitoring

### Key Metrics to Watch:
- Email delivery rate
- SMS delivery rate  
- Token usage rate
- Language distribution
- Error rates

### Admin Dashboard Features:
- Real-time notification tracking
- Success/failure statistics
- One-click resend for failed messages
- System configuration status

## 🔄 Maintenance

### Regular Tasks:
- Monitor delivery rates in admin dashboard
- Check for failed notifications and resend
- Review language detection accuracy
- Update translations as needed

### Adding New Languages:
1. Add to `/config/languages.json`
2. Add translations to `/config/translations.json`
3. Update country mapping in `languageService.js`
4. Test with `node test-notifications.js`
5. Deploy updates

## 🆘 Support Contacts

- **Technical Issues**: Check GitHub issues
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Twilio Support**: [twilio.com/support](https://twilio.com/support)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

✅ **System Ready for Production!**

The multi-language notification system is fully implemented and ready for deployment. Follow this checklist to ensure smooth operation.