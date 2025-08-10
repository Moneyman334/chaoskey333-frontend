import { WatchtowerEvent, PulseConfig, generateChaosGlyphId, generateEventCode, formatVaultUrl } from './watchtower';
import { watchtowerStore } from './watchtower-store';

// Re-export PulseConfig for convenience
export type { PulseConfig } from './watchtower';

// Interface for pulse channels
export interface PulseChannel {
  name: string;
  send(event: WatchtowerEvent, config: any): Promise<PulseResult>;
}

export interface PulseResult {
  success: boolean;
  timestamp: number;
  messageId?: string;
  error?: string;
}

// Twitter/X pulse implementation
export class TwitterPulseChannel implements PulseChannel {
  name = 'twitter';

  async send(event: WatchtowerEvent, config: any): Promise<PulseResult> {
    try {
      const { TwitterApi } = require('twitter-api-v2');
      
      const client = new TwitterApi({
        appKey: config.consumerKey,
        appSecret: config.consumerSecret,
        accessToken: config.accessToken,
        accessSecret: config.accessSecret,
      });

      const glyphId = event.data.glyphId || generateChaosGlyphId();
      const eventCode = event.data.eventCode || generateEventCode();
      const vaultUrl = formatVaultUrl(event.id);

      // Create tweet content based on event type
      let tweetText = '';
      switch (event.type) {
        case 'glyph_detection':
          tweetText = `🔮 GLYPH DETECTED\n\nChaos Glyph ID: ${glyphId}\nEvent Code: ${eventCode}\n\n⚡ Vault Live: ${vaultUrl}\n\n#ChaosKey333 #GlyphAlert`;
          break;
        case 'vault_event':
          tweetText = `🏛️ VAULT EVENT\n\nEvent Code: ${eventCode}\nTimestamp: ${new Date(event.data.timestamp).toISOString()}\n\n🔗 Join Live: ${vaultUrl}\n\n#ChaosKey333 #VaultEvent`;
          break;
        case 'relic_mint':
          tweetText = `🎯 RELIC MINTED\n\nGlyph: ${glyphId}\nEvent: ${eventCode}\n\n⚡ View: ${vaultUrl}\n\n#ChaosKey333 #RelicMint`;
          break;
        default:
          tweetText = `⚡ CHAOS ALERT\n\nEvent: ${eventCode}\nTimestamp: ${new Date(event.data.timestamp).toISOString()}\n\n🔗 ${vaultUrl}\n\n#ChaosKey333`;
      }

      const tweet = await client.v2.tweet(tweetText);
      
      return {
        success: true,
        timestamp: Date.now(),
        messageId: tweet.data.id
      };
    } catch (error: any) {
      console.error('Twitter pulse failed:', error);
      return {
        success: false,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }
}

// Email pulse implementation
export class EmailPulseChannel implements PulseChannel {
  name = 'email';

  async send(event: WatchtowerEvent, config: any): Promise<PulseResult> {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: 587,
        secure: false,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      const glyphId = event.data.glyphId || generateChaosGlyphId();
      const eventCode = event.data.eventCode || generateEventCode();
      const vaultUrl = formatVaultUrl(event.id);

      // Create email content based on event type
      let subject = '';
      let htmlContent = '';
      
      switch (event.type) {
        case 'glyph_detection':
          subject = `🔮 Glyph Detection Alert - ${eventCode}`;
          htmlContent = this.createGlyphEmailContent(glyphId, eventCode, vaultUrl, event);
          break;
        case 'vault_event':
          subject = `🏛️ Vault Event Alert - ${eventCode}`;
          htmlContent = this.createVaultEmailContent(eventCode, vaultUrl, event);
          break;
        default:
          subject = `⚡ ChaosKey333 Alert - ${eventCode}`;
          htmlContent = this.createGenericEmailContent(eventCode, vaultUrl, event);
      }

      // Send to mailing list (would need subscriber management)
      const mailOptions = {
        from: `"ChaosKey333 Watchtower" <${config.smtpUser}>`,
        to: config.recipients || 'alerts@chaoskey333.io', // Placeholder
        subject,
        html: htmlContent,
        attachments: await this.createEncryptedAttachments(event)
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        timestamp: Date.now(),
        messageId: info.messageId
      };
    } catch (error: any) {
      console.error('Email pulse failed:', error);
      return {
        success: false,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  private createGlyphEmailContent(glyphId: string, eventCode: string, vaultUrl: string, event: WatchtowerEvent): string {
    return `
      <div style="font-family: Arial, sans-serif; background: #000; color: #00ff00; padding: 20px;">
        <h1 style="color: #ff6600;">🔮 GLYPH DETECTION ALERT</h1>
        <div style="border: 1px solid #00ff00; padding: 15px; margin: 20px 0;">
          <h2>Chaos Glyph Detected</h2>
          <p><strong>Glyph ID:</strong> ${glyphId}</p>
          <p><strong>Event Code:</strong> ${eventCode}</p>
          <p><strong>Detection Time:</strong> ${new Date(event.data.timestamp).toISOString()}</p>
        </div>
        <div style="margin: 20px 0;">
          <a href="${vaultUrl}" style="background: #ff6600; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px;">
            🔗 Join Live Decode
          </a>
        </div>
        <p style="font-size: 12px; color: #666;">
          This is an automated alert from ChaosKey333 Watchtower. Event previews and lore fragments may be attached.
        </p>
      </div>
    `;
  }

  private createVaultEmailContent(eventCode: string, vaultUrl: string, event: WatchtowerEvent): string {
    return `
      <div style="font-family: Arial, sans-serif; background: #000; color: #00ff00; padding: 20px;">
        <h1 style="color: #ff6600;">🏛️ VAULT EVENT ALERT</h1>
        <div style="border: 1px solid #00ff00; padding: 15px; margin: 20px 0;">
          <h2>Vault Activity Detected</h2>
          <p><strong>Event Code:</strong> ${eventCode}</p>
          <p><strong>Timestamp:</strong> ${new Date(event.data.timestamp).toISOString()}</p>
          ${event.data.metadata ? `<p><strong>Metadata:</strong> ${JSON.stringify(event.data.metadata)}</p>` : ''}
        </div>
        <div style="margin: 20px 0;">
          <a href="${vaultUrl}" style="background: #ff6600; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px;">
            🔗 Join Live Vault
          </a>
        </div>
      </div>
    `;
  }

  private createGenericEmailContent(eventCode: string, vaultUrl: string, event: WatchtowerEvent): string {
    return `
      <div style="font-family: Arial, sans-serif; background: #000; color: #00ff00; padding: 20px;">
        <h1 style="color: #ff6600;">⚡ CHAOS ALERT</h1>
        <div style="border: 1px solid #00ff00; padding: 15px; margin: 20px 0;">
          <h2>Event Detected</h2>
          <p><strong>Event Code:</strong> ${eventCode}</p>
          <p><strong>Type:</strong> ${event.type}</p>
          <p><strong>Timestamp:</strong> ${new Date(event.data.timestamp).toISOString()}</p>
        </div>
        <div style="margin: 20px 0;">
          <a href="${vaultUrl}" style="background: #ff6600; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px;">
            🔗 View Event
          </a>
        </div>
      </div>
    `;
  }

  private async createEncryptedAttachments(event: WatchtowerEvent): Promise<any[]> {
    // TODO: Implement encrypted lore fragment attachments
    // This would involve creating encrypted preview files
    return [];
  }
}

// SMS pulse implementation
export class SMSPulseChannel implements PulseChannel {
  name = 'sms';

  async send(event: WatchtowerEvent, config: any): Promise<PulseResult> {
    try {
      const twilio = require('twilio');
      const client = twilio(config.twilioSid, config.twilioToken);

      const eventCode = event.data.eventCode || generateEventCode();
      const vaultUrl = formatVaultUrl(event.id);

      // Create SMS content based on event type
      let message = '';
      switch (event.type) {
        case 'glyph_detection':
          message = `⚡ Glyph Event Detected: ${eventCode} – Vault Live Now. ${vaultUrl}`;
          break;
        case 'vault_event':
          message = `🏛️ Vault Event: ${eventCode} – Join Live. ${vaultUrl}`;
          break;
        case 'relic_mint':
          message = `🎯 Relic Minted: ${eventCode} – View Now. ${vaultUrl}`;
          break;
        default:
          message = `⚡ Chaos Alert: ${eventCode} – Check Vault. ${vaultUrl}`;
      }

      // Send to subscriber list (would need phone number management)
      const messageInstance = await client.messages.create({
        body: message,
        from: config.fromNumber,
        to: config.recipients || '+1234567890' // Placeholder
      });

      return {
        success: true,
        timestamp: Date.now(),
        messageId: messageInstance.sid
      };
    } catch (error: any) {
      console.error('SMS pulse failed:', error);
      return {
        success: false,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }
}

// Multi-channel pulse orchestrator
export class MultiChannelPulseSystem {
  private channels: Map<string, PulseChannel> = new Map();
  private config: PulseConfig;

  constructor(config: PulseConfig) {
    this.config = config;
    this.channels.set('twitter', new TwitterPulseChannel());
    this.channels.set('email', new EmailPulseChannel());
    this.channels.set('sms', new SMSPulseChannel());
  }

  // Send pulse across all enabled channels with sync priority
  async sendPulse(event: WatchtowerEvent): Promise<Record<string, PulseResult>> {
    const enabledChannels = this.getEnabledChannels();
    const results: Record<string, PulseResult> = {};

    // Mark all channels as pending
    for (const channel of enabledChannels) {
      await watchtowerStore.storePulseStatus(event.id, channel, 'pending');
    }

    // Send pulses concurrently for sync priority (within 5-second window)
    const pulsePromises = enabledChannels.map(async (channelName) => {
      const channel = this.channels.get(channelName);
      if (!channel) return;

      try {
        const channelConfig = this.getChannelConfig(channelName);
        const result = await channel.send(event, channelConfig);
        
        // Store result
        await watchtowerStore.storePulseStatus(
          event.id, 
          channelName, 
          result.success ? 'sent' : 'failed'
        );
        
        results[channelName] = result;
      } catch (error: any) {
        console.error(`Pulse failed for ${channelName}:`, error);
        results[channelName] = {
          success: false,
          timestamp: Date.now(),
          error: error.message
        };
        
        await watchtowerStore.storePulseStatus(event.id, channelName, 'failed');
      }
    });

    // Wait for all pulses with timeout
    await Promise.allSettled(pulsePromises);

    // Check if sync window requirement is met (5 seconds)
    const syncCheck = await this.validateSyncWindow(event.id, results);
    console.log(`Pulse sync for event ${event.id}:`, syncCheck);

    return results;
  }

  private getEnabledChannels(): string[] {
    const enabled: string[] = [];
    if (this.config.twitter.enabled) enabled.push('twitter');
    if (this.config.email.enabled) enabled.push('email');
    if (this.config.sms.enabled) enabled.push('sms');
    return enabled;
  }

  private getChannelConfig(channelName: string): any {
    switch (channelName) {
      case 'twitter':
        return this.config.twitter;
      case 'email':
        return this.config.email;
      case 'sms':
        return this.config.sms;
      default:
        return {};
    }
  }

  private async validateSyncWindow(eventId: string, results: Record<string, PulseResult>): Promise<boolean> {
    const timestamps = Object.values(results).map(r => r.timestamp);
    if (timestamps.length === 0) return true;

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const windowMs = this.config.syncWindow * 1000;

    return (maxTime - minTime) <= windowMs;
  }
}