const twilio = require('twilio');
const { translate } = require('./languageService');
const { storeNotificationRecord } = require('./tokenService');

let twilioClient = null;

/**
 * Initialize Twilio client
 */
function initializeTwilio() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }
  
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  
  return twilioClient;
}

/**
 * Format phone number for international SMS
 * @param {string} phoneNumber - Phone number
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    // If number doesn't start with country code, assume US (+1)
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * Generate QR-friendly short link
 * @param {string} mintLink - Original mint link
 * @returns {string} - Shortened link for QR scanning
 */
function generateQRLink(mintLink) {
  // In a real implementation, you might use a URL shortener service
  // For now, we'll just return the original link
  return mintLink;
}

/**
 * Send SMS notification
 * @param {Object} smsData - SMS configuration
 * @returns {Promise<Object>} - Send result
 */
async function sendSMSNotification(smsData) {
  const client = initializeTwilio();
  
  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('TWILIO_PHONE_NUMBER not configured');
  }

  const { 
    to, 
    language = 'en', 
    productName, 
    mintLink, 
    walletAddress,
    sessionId 
  } = smsData;

  try {
    const formattedTo = formatPhoneNumber(to);
    const qrLink = generateQRLink(mintLink);
    
    // Generate SMS message
    const message = translate('sms', 'message', language, {
      productName,
      link: mintLink,
      qrLink
    });

    // Send SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo
    });

    // Store notification record
    const record = {
      type: 'sms',
      to: formattedTo,
      language,
      productName,
      walletAddress,
      sessionId,
      status: 'sent',
      result: {
        sid: result.sid,
        status: result.status,
        dateCreated: result.dateCreated
      },
      message
    };

    const recordId = await storeNotificationRecord(record);

    console.log(`📱 SMS sent successfully to ${formattedTo} in ${language}`, { 
      recordId, 
      twilioSid: result.sid 
    });
    
    return {
      success: true,
      recordId,
      twilioSid: result.sid,
      language,
      to: formattedTo
    };

  } catch (error) {
    console.error('SMS send error:', error);
    
    // Store failed notification record
    const record = {
      type: 'sms',
      to: formatPhoneNumber(to),
      language,
      productName,
      walletAddress,
      sessionId,
      status: 'failed',
      error: error.message
    };

    const recordId = await storeNotificationRecord(record);

    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Check SMS delivery status
 * @param {string} messageSid - Twilio message SID
 * @returns {Promise<Object>} - Delivery status
 */
async function checkSMSStatus(messageSid) {
  try {
    const client = initializeTwilio();
    const message = await client.messages(messageSid).fetch();
    
    return {
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated,
      dateSent: message.dateSent
    };
    
  } catch (error) {
    console.error('SMS status check error:', error);
    throw new Error(`Failed to check SMS status: ${error.message}`);
  }
}

/**
 * Resend a failed SMS notification
 * @param {string} recordId - Original notification record ID
 * @returns {Promise<Object>} - Resend result
 */
async function resendSMS(recordId) {
  try {
    const { getNotificationRecord } = require('./tokenService');
    const record = await getNotificationRecord(recordId);
    
    if (!record || record.type !== 'sms') {
      throw new Error('SMS record not found');
    }

    if (record.status === 'sent') {
      // Check if the message was actually delivered
      if (record.result?.sid) {
        const status = await checkSMSStatus(record.result.sid);
        if (status.status === 'delivered') {
          throw new Error('SMS was already delivered successfully');
        }
      }
    }

    // Resend the SMS
    const result = await sendSMSNotification({
      to: record.to,
      language: record.language,
      productName: record.productName,
      mintLink: record.mintLink,
      walletAddress: record.walletAddress,
      sessionId: record.sessionId
    });

    console.log(`📱 SMS resent successfully for record ${recordId}`);
    return result;

  } catch (error) {
    console.error('SMS resend error:', error);
    throw error;
  }
}

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber) return false;
  
  // Basic validation - should contain digits and be reasonable length
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Get SMS pricing for a country (if needed for cost estimation)
 * @param {string} countryCode - ISO country code
 * @returns {Promise<Object>} - Pricing information
 */
async function getSMSPricing(countryCode) {
  try {
    const client = initializeTwilio();
    const pricing = await client.pricing.v2.messaging
      .countries(countryCode.toUpperCase())
      .fetch();
    
    return {
      country: pricing.country,
      isoCountry: pricing.isoCountry,
      outboundSMSPrices: pricing.outboundSmsPrices
    };
    
  } catch (error) {
    console.error('SMS pricing fetch error:', error);
    return null;
  }
}

module.exports = {
  sendSMSNotification,
  checkSMSStatus,
  resendSMS,
  validatePhoneNumber,
  getSMSPricing,
  formatPhoneNumber
};