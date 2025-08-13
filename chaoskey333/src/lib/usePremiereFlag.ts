import { useState, useEffect, useCallback } from 'react';
import { PremiereStatus } from '@/types/premiere';

interface UsePremiereHookResult {
  status: PremiereStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  manualCountdown: () => Promise<void>;
  manualIgnition: () => Promise<void>;
  emergencyStop: () => Promise<void>;
}

const DEFAULT_POLL_INTERVAL = 2000; // 2 seconds
const ACTIVE_POLL_INTERVAL = 1000; // 1 second during active premiere

export function usePremiereFlag(
  pollInterval: number = DEFAULT_POLL_INTERVAL,
  adminMode: boolean = false
): UsePremiereHookResult {
  const [status, setStatus] = useState<PremiereStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/premiere-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch premiere status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching premiere status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  const manualCountdown = useCallback(async () => {
    if (!adminMode) {
      throw new Error('Admin mode required for manual controls');
    }

    try {
      const response = await fetch('/api/premiere-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Key': process.env.NEXT_PUBLIC_VAULT_KEY || '',
        },
        body: JSON.stringify({
          action: 'manual_countdown',
          adminUserId: 'admin' // In a real app, get from auth context
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start manual countdown: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      } else {
        throw new Error(data.error || 'Failed to start countdown');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start countdown');
      throw err;
    }
  }, [adminMode]);

  const manualIgnition = useCallback(async () => {
    if (!adminMode) {
      throw new Error('Admin mode required for manual controls');
    }

    try {
      const response = await fetch('/api/premiere-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Key': process.env.NEXT_PUBLIC_VAULT_KEY || '',
        },
        body: JSON.stringify({
          action: 'manual_ignition',
          adminUserId: 'admin' // In a real app, get from auth context
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger manual ignition: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      } else {
        throw new Error(data.error || 'Failed to trigger ignition');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger ignition');
      throw err;
    }
  }, [adminMode]);

  const emergencyStop = useCallback(async () => {
    if (!adminMode) {
      throw new Error('Admin mode required for emergency stop');
    }

    try {
      const response = await fetch('/api/premiere-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Key': process.env.NEXT_PUBLIC_VAULT_KEY || '',
        },
        body: JSON.stringify({
          action: 'emergency_stop',
          adminUserId: 'admin' // In a real app, get from auth context
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute emergency stop: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      } else {
        throw new Error(data.error || 'Failed to execute emergency stop');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute emergency stop');
      throw err;
    }
  }, [adminMode]);

  // Set up polling effect
  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Determine poll interval based on premiere status
    const currentInterval = status?.active ? ACTIVE_POLL_INTERVAL : pollInterval;

    const intervalId = setInterval(fetchStatus, currentInterval);

    return () => clearInterval(intervalId);
  }, [fetchStatus, pollInterval, status?.active]);

  // Handle countdown updates
  useEffect(() => {
    if (status?.countdown && status.countdown > 0) {
      const countdownInterval = setInterval(() => {
        setStatus(prevStatus => {
          if (!prevStatus?.countdown) return prevStatus;
          
          const newCountdown = Math.max(0, prevStatus.countdown - 1000);
          
          return {
            ...prevStatus,
            countdown: newCountdown > 0 ? newCountdown : undefined
          };
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [status?.countdown]);

  return {
    status,
    isLoading,
    error,
    refresh,
    manualCountdown,
    manualIgnition,
    emergencyStop,
  };
}