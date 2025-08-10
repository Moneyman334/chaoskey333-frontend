const { Resend } = require('resend');
const QRCode = require('qrcode');
const { translate } = require('./languageService');
const { storeNotificationRecord } = require('./tokenService');

// Initialize Resend only when API key is available
let resend = null;

function initializeResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Generate HTML email template
 * @param {Object} data - Email data
 * @returns {string} - HTML content
 */
function generateEmailHTML(data) {
  const { language, productName, mintLink, qrCodeData, supportEmail } = data;
  
  const greeting = translate('email', 'greeting', language);
  const body = translate('email', 'body', language);
  const ctaText = translate('email', 'cta', language);
  const expiresText = translate('email', 'expires', language);
  const supportText = translate('email', 'support', language);

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChaosKey333 Relic Ready</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: #ffffff;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(10px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .header { 
            background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d79ff);
            padding: 30px; 
            text-align: center; 
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.2);
        }
        .header-content { position: relative; z-index: 1; }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .tagline { 
            font-size: 14px; 
            opacity: 0.9;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        .content { 
            padding: 40px 30px; 
            text-align: center; 
        }
        .greeting { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 20px;
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .message { 
            font-size: 16px; 
            line-height: 1.6; 
            margin-bottom: 30px;
            color: #e0e0e0;
        }
        .product-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .product-name {
            font-size: 18px;
            font-weight: bold;
            color: #ffd93d;
            margin-bottom: 10px;
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            color: #000; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 18px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }
        .qr-section {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            color: #333;
        }
        .qr-code { 
            margin: 15px 0;
        }
        .qr-code img {
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        .warning { 
            font-size: 14px; 
            color: #ffd93d; 
            margin: 20px 0;
            background: rgba(255, 217, 61, 0.1);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #ffd93d;
        }
        .footer { 
            background: rgba(0, 0, 0, 0.3);
            padding: 20px; 
            text-align: center; 
            font-size: 12px;
            color: #aaa;
        }
        .support-link {
            color: #6bcf7f;
            text-decoration: none;
        }
        .support-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="logo">⚡️ ChaosKey333</div>
                <div class="tagline">Vault of Digital Relics</div>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hey ${greeting}! 🔥</div>
            
            <div class="message">
                ${body}
            </div>
            
            <div class="product-info">
                <div class="product-name">${productName}</div>
                <div>Ready for minting to your vault</div>
            </div>
            
            <a href="${mintLink}" class="cta-button">${ctaText}</a>
            
            <div class="qr-section">
                <div><strong>Scan to Mint:</strong></div>
                <div class="qr-code">
                    <img src="cid:qrcode" alt="QR Code for minting" width="150" height="150">
                </div>
                <div style="font-size: 12px; color: #666;">
                    Scan with your phone to access the mint page
                </div>
            </div>
            
            <div class="warning">
                ⏰ ${expiresText}
            </div>
        </div>
        
        <div class="footer">
            <div>${supportText}</div>
            <div style="margin-top: 10px;">
                <a href="mailto:${supportEmail}" class="support-link">${supportEmail}</a>
            </div>
            <div style="margin-top: 15px; opacity: 0.7;">
                © 2024 ChaosKey333. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate plain text email version
 * @param {Object} data - Email data
 * @returns {string} - Plain text content
 */
function generateEmailText(data) {
  const { language, productName, mintLink, supportEmail } = data;
  
  const greeting = translate('email', 'greeting', language);
  const body = translate('email', 'body', language);
  const ctaText = translate('email', 'cta', language);
  const expiresText = translate('email', 'expires', language);
  const supportText = translate('email', 'support', language);

  return `
⚡️ ChaosKey333 - Vault of Digital Relics

Hey ${greeting}! 🔥

${body}

PRODUCT: ${productName}
STATUS: Ready for minting to your vault

${ctaText}: ${mintLink}

⏰ ${expiresText}

${supportText}
Support Email: ${supportEmail}

© 2024 ChaosKey333. All rights reserved.
`;
}

/**
 * Send email notification
 * @param {Object} emailData - Email configuration
 * @returns {Promise<Object>} - Send result
 */
async function sendEmailNotification(emailData) {
  const resendClient = initializeResend();
  
  if (!resendClient) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const { 
    to, 
    language = 'en', 
    productName, 
    mintLink, 
    walletAddress,
    sessionId 
  } = emailData;

  try {
    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(mintLink, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const supportEmail = 'support@chaoskey333.com';
    
    const templateData = {
      language,
      productName,
      mintLink,
      supportEmail,
      qrCodeData: qrCodeBuffer
    };

    const subject = translate('email', 'subject', language);
    const htmlContent = generateEmailHTML(templateData);
    const textContent = generateEmailText(templateData);

    // Send email via Resend
    const result = await resendClient.emails.send({
      from: 'ChaosKey333 <noreply@chaoskey333.com>',
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode'
        }
      ],
      tags: [
        { name: 'type', value: 'mint-notification' },
        { name: 'language', value: language },
        { name: 'product', value: productName }
      ]
    });

    // Store notification record
    const record = {
      type: 'email',
      to,
      language,
      productName,
      walletAddress,
      sessionId,
      status: 'sent',
      result: result,
      subject
    };

    const recordId = await storeNotificationRecord(record);

    console.log(`📧 Email sent successfully to ${to} in ${language}`, { recordId, resendId: result.data?.id });
    
    return {
      success: true,
      recordId,
      resendId: result.data?.id,
      language
    };

  } catch (error) {
    console.error('Email send error:', error);
    
    // Store failed notification record
    const record = {
      type: 'email',
      to,
      language,
      productName,
      walletAddress,
      sessionId,
      status: 'failed',
      error: error.message
    };

    const recordId = await storeNotificationRecord(record);

    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Resend a failed email notification
 * @param {string} recordId - Original notification record ID
 * @returns {Promise<Object>} - Resend result
 */
async function resendEmail(recordId) {
  try {
    const { getNotificationRecord } = require('./tokenService');
    const record = await getNotificationRecord(recordId);
    
    if (!record || record.type !== 'email') {
      throw new Error('Email record not found');
    }

    if (record.status === 'sent') {
      throw new Error('Email was already sent successfully');
    }

    // Resend the email
    const result = await sendEmailNotification({
      to: record.to,
      language: record.language,
      productName: record.productName,
      mintLink: record.mintLink,
      walletAddress: record.walletAddress,
      sessionId: record.sessionId
    });

    console.log(`📧 Email resent successfully for record ${recordId}`);
    return result;

  } catch (error) {
    console.error('Email resend error:', error);
    throw error;
  }
}

module.exports = {
  sendEmailNotification,
  resendEmail
};