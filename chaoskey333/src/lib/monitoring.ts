/**
 * Simple logging-based monitoring system
 * Can be extended with Sentry when @sentry/nextjs is installed
 */

interface MonitoringConfig {
  environment: string;
  enabled: boolean;
}

class SimpleMonitoring {
  private config: MonitoringConfig;

  constructor() {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      enabled: true // Always enabled for basic logging
    };
  }

  /**
   * Initialize monitoring
   */
  async init() {
    if (typeof window !== 'undefined') {
      console.log('🔍 Simple monitoring initialized for', this.config.environment);
    }
  }

  /**
   * Log an error
   */
  captureException(error: Error, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const errorData = {
      timestamp,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      environment: this.config.environment
    };

    if (this.config.environment === 'development') {
      console.error('🚨 Error captured:', errorData);
    } else {
      // In production, you might want to send this to a logging service
      console.error('Error:', error.message, context);
    }
  }

  /**
   * Log a message
   */
  captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info', context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      context,
      environment: this.config.environment
    };

    if (this.config.environment === 'development') {
      if (level === 'warning') {
        console.warn(`📝 Message [${level}]:`, logData);
      } else if (level === 'error') {
        console.error(`📝 Message [${level}]:`, logData);
      } else {
        console.log(`📝 Message [${level}]:`, logData);
      }
    } else {
      if (level === 'warning') {
        console.warn(message, context);
      } else if (level === 'error') {
        console.error(message, context);
      } else {
        console.log(message, context);
      }
    }
  }

  /**
   * Set user context (for future logging)
   */
  setUser(user: { id?: string; email?: string; username?: string }) {
    if (this.config.environment === 'development') {
      console.log('👤 User context set:', user);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
    if (this.config.environment === 'development') {
      console.log(`🍞 Breadcrumb [${category || 'general'}]:`, message, data);
    }
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const monitoring = new SimpleMonitoring();

/**
 * Initialize monitoring - call this in your app startup
 */
export async function initializeMonitoring() {
  await monitoring.init();
}

// Re-export for convenience
export { monitoring as default };