import React, { createContext, useContext } from 'react';

interface FogContextType {
  isFogMode: boolean;
  toggleFogMode: () => void;
}

const FogContext = createContext<FogContextType>({ isFogMode: false, toggleFogMode: () => {} });

export const FogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FogContext.Provider value={{ isFogMode: false, toggleFogMode: () => {} }}>
    {children}
  </FogContext.Provider>
);

export const useFog = () => useContext(FogContext);
