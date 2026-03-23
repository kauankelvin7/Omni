import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextValue {
  isLoading: boolean;
  increment: () => void;
  decrement: () => void;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  increment: () => {},
  decrement: () => {},
});

export const useLoading = () => useContext(LoadingContext);

// PubSub event bus para chamadas de API sem usar hooks (evita dependência circular no axios)
export const loadingBus = {
  listeners: new Set<(delta: number) => void>(),
  emit(delta: number) { this.listeners.forEach(l => l(delta)); }
};

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  return (
    <LoadingContext.Provider value={{ isLoading: count > 0, increment, decrement }}>
      {children}
      {count > 0 && (
        <div
          aria-label="Carregando..."
          style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            height: 3, zIndex: 99999,
            background: 'linear-gradient(90deg, #5E6AD2, #8B9CF4, #5E6AD2)',
            backgroundSize: '200% 100%',
            animation: 'loadingBar 1.2s ease infinite',
          }}
        />
      )}
      <style>{`
        @keyframes loadingBar {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </LoadingContext.Provider>
  );
};
