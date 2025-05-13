import { createContext, useContext, ReactNode, useState } from "react";

const RedirectsTableContext = createContext(null);

const RedirectsTableContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [httpCodeFilter, setHttpCodeFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  return (
    <RedirectsTableContext.Provider
      value={{
        sortBy,
        httpCodeFilter,
        typeFilter,
        setSortBy,
        setHttpCodeFilter,
        setTypeFilter,
      }}
    >
      {children}
    </RedirectsTableContext.Provider>
  );
};

export const useRedirectsTableFilters = () => {
  const context = useContext(RedirectsTableContext);
  if (context === null) {
    throw new Error(
      "useRedirectsTableFilters must be used within a RedirectsTableContextProvider"
    );
  }
  return context;
};

export default RedirectsTableContextProvider;
