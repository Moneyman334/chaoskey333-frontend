"use client";

import { useEffect } from 'react';
import { initializeMonitoring } from '../lib/monitoring';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // Initialize monitoring when the app starts
    initializeMonitoring().catch((error) => {
      console.warn('Failed to initialize monitoring:', error);
    });
  }, []);

  return <>{children}</>;
}