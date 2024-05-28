import React, { createContext, useContext, useState, useCallback } from "react";

const StagedChangesContext = createContext(null);

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

  const clearStagedChanges = useCallback(() => {
    setStagedChanges({});
  }, []);

  return (
    <StagedChangesContext.Provider
      value={{ stagedChanges, updateStagedChanges, clearStagedChanges }}
    >
      {children}
    </StagedChangesContext.Provider>
  );
};

export const useStagedChanges = () => useContext(StagedChangesContext);
