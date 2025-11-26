import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleBackdrop: () => void;
  showBackdrop: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleBackdrop = () => {
    setShowBackdrop(!showBackdrop);
    if (!showBackdrop) {
      setMobileSidebarOpen(true);
    } else {
      setMobileSidebarOpen(false);
    }
  };

  const value: LayoutContextType = {
    isSidebarCollapsed,
    setSidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    toggleSidebar,
    toggleBackdrop,
    showBackdrop,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};