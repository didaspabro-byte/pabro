import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'UGX' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUGX: number) => string;
  convertPrice: (priceInUGX: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const EXCHANGE_RATE = 3700; // 1 USD = 3700 UGX

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('UGX');

  useEffect(() => {
    const saved = localStorage.getItem('store_currency');
    if (saved === 'USD' || saved === 'UGX') {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('store_currency', c);
    } catch (e) {
      console.error('Failed to save currency to localStorage:', e);
    }
  };

  const convertPrice = (priceInUGX: number): number => {
    if (currency === 'UGX') {
      return priceInUGX;
    }
    return priceInUGX / EXCHANGE_RATE;
  };

  const formatPrice = (priceInUGX: number): string => {
    if (currency === 'UGX') {
      return `UGX ${Math.round(priceInUGX).toLocaleString()}`;
    } else {
      const usdValue = priceInUGX / EXCHANGE_RATE;
      // We can format with 2 decimals, or if it's an integer, format cleanly
      return `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
