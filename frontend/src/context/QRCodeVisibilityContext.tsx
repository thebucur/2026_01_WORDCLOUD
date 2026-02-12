import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

const STORAGE_KEY = 'qr_code_visible';

interface QRCodeVisibilityContextValue {
  isVisible: boolean;
  toggleVisibility: () => void;
}

const QRCodeVisibilityContext = createContext<QRCodeVisibilityContextValue | null>(null);

export function QRCodeVisibilityProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return true;
  });

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value: QRCodeVisibilityContextValue = {
    isVisible,
    toggleVisibility,
  };

  return (
    <QRCodeVisibilityContext.Provider value={value}>
      {children}
    </QRCodeVisibilityContext.Provider>
  );
}

export function useQRCodeVisibility(): QRCodeVisibilityContextValue {
  const ctx = useContext(QRCodeVisibilityContext);
  if (!ctx) throw new Error('useQRCodeVisibility must be used within QRCodeVisibilityProvider');
  return ctx;
}
