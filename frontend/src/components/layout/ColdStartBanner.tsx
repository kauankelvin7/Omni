import React, { useState, useEffect } from 'react';

export const ColdStartBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only if loading takes more than 3 seconds (likely a cold start)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(94, 106, 210, 0.95)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: 500,
      animation: 'slideUp 0.4s ease-out',
    }}>
      <span style={{ fontSize: '18px' }}>🚀</span>
      <div>
        A plataforma está inicializando... 
        <span style={{ display: 'block', fontSize: '12px', opacity: 0.8, fontWeight: 400 }}>
          O primeiro acesso pode levar até 30 segundos (Cold Start).
        </span>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
