import { createContext, useContext, ReactNode } from "react";

const RedirectsContext = createContext(null);

const RedirectsContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <RedirectsContext.Provider value={null}>
      {children}
    </RedirectsContext.Provider>
  );
};

export const useRedirectsContext = () => {
  const context = useContext(RedirectsContext);
  if (context === null) {
    throw new Error(
      "useRedirectsContext must be used within a RedirectsContextProvider"
    );
  }
  return context;
};

export default RedirectsContextProvider;
