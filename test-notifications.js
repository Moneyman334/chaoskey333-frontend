#!/usr/bin/env node

const { validateNotificationConfig } = require('./services/notificationService');
const { detectLanguage, translate, getSupportedLanguages } = require('./services/languageService');

console.log('🧪 Testing ChaosKey333 Multi-Language Notification System\n');

// Test 1: Configuration validation
console.log('1️⃣ Testing configuration validation...');
const config = validateNotificationConfig();
console.log('Configuration status:', JSON.stringify(config, null, 2));

// Test 2: Language detection
console.log('\n2️⃣ Testing language detection...');
const testSources = [
  {
    name: 'Spanish user',
    sources: {
      acceptLanguage: 'es-ES,es;q=0.9,en;q=0.8',
      countryCode: 'ES'
    }
  },
  {
    name: 'Japanese user',
    sources: {
      acceptLanguage: 'ja-JP,ja;q=0.9,en;q=0.8',
      countryCode: 'JP'
    }
  },
  {
    name: 'French user with metadata',
    sources: {
      checkoutMetadata: { language: 'fr' },
      acceptLanguage: 'en-US,en;q=0.9'
    }
  },
  {
    name: 'Default fallback',
    sources: {
      acceptLanguage: 'unknown',
      countryCode: 'XX'
    }
  }
];

testSources.forEach(test => {
  const detected = detectLanguage(test.sources);
  console.log(`${test.name}: ${detected}`);
});

// Test 3: Translation system
console.log('\n3️⃣ Testing translations...');
const languages = ['en', 'es', 'fr', 'ja', 'zh'];
languages.forEach(lang => {
  const subject = translate('email', 'subject', lang);
  const smsMessage = translate('sms', 'message', lang, {
    productName: 'Test Relic',
    link: 'https://example.com/mint',
    qrLink: 'https://example.com/qr'
  });
  console.log(`${lang}: ${subject.substring(0, 50)}...`);
  console.log(`SMS: ${smsMessage.substring(0, 80)}...`);
});

// Test 4: Supported languages
console.log('\n4️⃣ Supported languages:');
const supportedLangs = getSupportedLanguages();
supportedLangs.forEach(lang => {
  console.log(`- ${lang.code}: ${lang.name}${lang.default ? ' (default)' : ''}`);
});

console.log('\n✅ Test completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Set up environment variables in Vercel');
console.log('2. Configure Resend API key');
console.log('3. Configure Twilio credentials');
console.log('4. Deploy to Vercel');
console.log('5. Test with real checkout session');