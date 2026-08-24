import React, { createContext, useContext, useState, useCallback } from "react";
import { GridRowId } from "@mui/x-data-grid-pro";

const StagedChangesContext = createContext(null);

export const StagedChangesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stagedChanges, setStagedChanges] = useState({});

  const updateStagedChanges = useCallback(
    // `value` is `any` because a staged change carries whatever the edited cell holds,
    // which varies by field datatype — its callers `BooleanCell` and `DropdownCell`
    // already declare their own `handleChange` the same way
    (id: GridRowId, field: string, value: any) => {
      // `ItemList/index.tsx` sets every row id to `meta.ZUID`, so this is a string
      // today and `String()` is a no-op; it is here because `GridRowId` also admits
      // numbers, which have no `startsWith`.
      if (String(id).startsWith("new")) {
        return;
      }
      setStagedChanges((prev: any) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      }));
    },
    []
  );

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
