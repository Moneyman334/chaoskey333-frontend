'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AnalyticsContextType {
  trackEvent: (event: string, data?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const trackEvent = (event: string, data?: any) => {
    // Check if analytics is enabled
    const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    
    if (!analyticsEnabled) return;

    // Create anonymous hash for privacy
    const anonymousData = data ? {
      ...data,
      sessionHash: createAnonymousHash(data),
      timestamp: new Date().toISOString()
    } : {
      timestamp: new Date().toISOString()
    };

    // Log to console in development, send to analytics service in production
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event, anonymousData);
    } else {
      // In production, this would send to your analytics service
      // For now, we'll just log it
      console.log('📊 Analytics Event:', event, anonymousData);
    }

    // You could integrate with services like Google Analytics, Mixpanel, etc.
    // Example: gtag('event', event, anonymousData);
  };

  const createAnonymousHash = (data: any): string => {
    // Create a simple hash for anonymization
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};