const { detectLanguage } = require('./languageService');
const { generateClaimToken } = require('./tokenService');
const { sendEmailNotification } = require('./emailService');
const { sendSMSNotification, validatePhoneNumber } = require('./smsService');

/**
 * Send multi-language notifications (email and/or SMS)
 * @param {Object} notificationData - Notification configuration
 * @returns {Promise<Object>} - Send results
 */
async function sendNotifications(notificationData) {
  const {
    walletAddress,
    email,
    phone,
    productName,
    sessionId,
    checkoutMetadata = {},
    userAgent = '',
    acceptLanguage = '',
    countryCode = ''
  } = notificationData;

  // Check environment configuration
  const emailEnabled = process.env.ENABLE_EMAIL !== 'false'; // Default enabled
  const smsEnabled = process.env.ENABLE_SMS !== 'false'; // Default enabled
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chaoskey333-casino.vercel.app';

  // Detect user's preferred language
  const language = detectLanguage({
    checkoutMetadata,
    acceptLanguage,
    countryCode,
    userAgent
  });

  console.log(`🌍 Detected language: ${language} for wallet: ${walletAddress}`);

  try {
    // Generate secure claim token
    const tokenMetadata = {
      walletAddress,
      email,
      phone,
      productName,
      sessionId,
      language,
      countryCode
    };

    const claimToken = await generateClaimToken(tokenMetadata);
    const mintLink = `${baseUrl}/mint?token=${claimToken}`;

    const results = {
      language,
      claimToken,
      mintLink,
      email: null,
      sms: null,
      errors: []
    };

    // Send email notification if enabled and email provided
    if (emailEnabled && email) {
      try {
        console.log(`📧 Sending email notification to ${email} in ${language}`);
        const emailResult = await sendEmailNotification({
          to: email,
          language,
          productName,
          mintLink,
          walletAddress,
          sessionId
        });
        results.email = emailResult;
      } catch (error) {
        console.error('Email notification failed:', error);
        results.errors.push({
          type: 'email',
          error: error.message
        });
      }
    } else if (!emailEnabled) {
      console.log('📧 Email notifications disabled via environment variable');
    } else {
      console.log('📧 No email provided, skipping email notification');
    }

    // Send SMS notification if enabled and phone provided
    if (smsEnabled && phone) {
      if (validatePhoneNumber(phone)) {
        try {
          console.log(`📱 Sending SMS notification to ${phone} in ${language}`);
          const smsResult = await sendSMSNotification({
            to: phone,
            language,
            productName,
            mintLink,
            walletAddress,
            sessionId
          });
          results.sms = smsResult;
        } catch (error) {
          console.error('SMS notification failed:', error);
          results.errors.push({
            type: 'sms',
            error: error.message
          });
        }
      } else {
        console.log(`📱 Invalid phone number format: ${phone}`);
        results.errors.push({
          type: 'sms',
          error: 'Invalid phone number format'
        });
      }
    } else if (!smsEnabled) {
      console.log('📱 SMS notifications disabled via environment variable');
    } else {
      console.log('📱 No phone provided, skipping SMS notification');
    }

    // Log summary
    const emailStatus = results.email ? 'sent' : 'skipped/failed';
    const smsStatus = results.sms ? 'sent' : 'skipped/failed';
    
    console.log(`✅ Notification summary for ${walletAddress}: Email: ${emailStatus}, SMS: ${smsStatus}, Language: ${language}`);

    return results;

  } catch (error) {
    console.error('Critical notification error:', error);
    throw new Error(`Failed to process notifications: ${error.message}`);
  }
}

/**
 * Process payment success and send notifications
 * @param {Object} session - Stripe checkout session
 * @returns {Promise<Object>} - Processing result
 */
async function processPaymentSuccess(session) {
  try {
    console.log('💰 Processing payment success for session:', session.id);

    const { metadata } = session;
    const walletAddress = metadata.walletAddress;
    const connectedWalletType = metadata.connectedWalletType;

    if (!walletAddress) {
      throw new Error('Wallet address not found in session metadata');
    }

    // Extract customer information
    const customerDetails = session.customer_details || {};
    const email = customerDetails.email;
    const phone = customerDetails.phone;

    // Get checkout metadata and other context
    const checkoutMetadata = metadata || {};
    const countryCode = customerDetails.address?.country || '';
    
    // Determine product name from line items
    let productName = 'ChaosKey333 Relic';
    if (session.line_items && session.line_items.data && session.line_items.data.length > 0) {
      productName = session.line_items.data[0].description || productName;
    }

    // Send notifications
    const notificationResult = await sendNotifications({
      walletAddress,
      email,
      phone,
      productName,
      sessionId: session.id,
      checkoutMetadata,
      countryCode
    });

    console.log('🎉 Payment processing completed successfully:', {
      sessionId: session.id,
      walletAddress,
      language: notificationResult.language,
      emailSent: !!notificationResult.email,
      smsSent: !!notificationResult.sms
    });

    return {
      success: true,
      sessionId: session.id,
      walletAddress,
      notifications: notificationResult
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

/**
 * Extract language preference from various sources
 * @param {Object} request - Express request object
 * @returns {string} - Detected language code
 */
function detectLanguageFromRequest(request) {
  const acceptLanguage = request.headers['accept-language'] || '';
  const userAgent = request.headers['user-agent'] || '';
  const countryCode = request.headers['cf-ipcountry'] || ''; // Cloudflare country header
  
  return detectLanguage({
    acceptLanguage,
    userAgent,
    countryCode
  });
}

/**
 * Validate notification configuration
 * @returns {Object} - Configuration status
 */
function validateNotificationConfig() {
  const config = {
    email: {
      enabled: process.env.ENABLE_EMAIL !== 'false',
      configured: !!process.env.RESEND_API_KEY,
      ready: false
    },
    sms: {
      enabled: process.env.ENABLE_SMS !== 'false',
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
      ready: false
    },
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://chaoskey333-casino.vercel.app',
    kv: {
      configured: !!process.env.KV_URL || !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    }
  };

  config.email.ready = config.email.enabled && config.email.configured;
  config.sms.ready = config.sms.enabled && config.sms.configured;

  return config;
}

module.exports = {
  sendNotifications,
  processPaymentSuccess,
  detectLanguageFromRequest,
  validateNotificationConfig
};