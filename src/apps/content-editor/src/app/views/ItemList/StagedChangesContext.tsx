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
      // Rows added inline get a `new…` string id; MUI supplies numeric ids elsewhere,
      // so coerce rather than assume `startsWith` exists
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
