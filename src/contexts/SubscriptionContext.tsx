import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  initRevenueCat,
  checkIsProEntitlement,
  purchasePro,
  restorePurchases,
} from '../services/revenuecat';

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  purchase: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const pro = await checkIsProEntitlement();
      setIsPro(pro);
    } catch (e) {
      console.warn('[SubscriptionContext] refresh error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initRevenueCat().then(() => refresh());
  }, [refresh]);

  const purchase = useCallback(async (): Promise<boolean> => {
    const success = await purchasePro();
    if (success) setIsPro(true);
    return success;
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const success = await restorePurchases();
    if (success) setIsPro(true);
    return success;
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoading, purchase, restore, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
