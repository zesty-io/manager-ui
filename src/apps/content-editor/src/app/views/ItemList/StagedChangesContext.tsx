import React, { createContext, useContext, useState, useCallback } from "react";

// Create a context for staged changes
const StagedChangesContext = createContext(null);

// Create a provider component
export const StagedChangesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stagedChanges, setStagedChanges] = useState({});

  const updateStagedChanges = useCallback((id, field, value) => {
    setStagedChanges((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  }, []);

  return (
    <StagedChangesContext.Provider
      value={{ stagedChanges, updateStagedChanges }}
    >
      {children}
    </StagedChangesContext.Provider>
  );
};

export const useStagedChanges = () => useContext(StagedChangesContext);
