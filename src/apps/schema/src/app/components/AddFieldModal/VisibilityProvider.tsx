import React, { createContext, useContext, useState, ReactNode } from "react";

interface VisibilityContextType {
  isHidden: boolean;
  hide: (hide: boolean) => void;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(
  undefined
);

export const VisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isHidden, setIsHidden] = useState(false);

  const hide = (hide: boolean) => {
    setIsHidden(hide);
  };

  return (
    <VisibilityContext.Provider value={{ isHidden, hide }}>
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
};
