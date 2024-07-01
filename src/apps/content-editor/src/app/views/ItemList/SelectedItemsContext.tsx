import React, { createContext, useContext, useState, useCallback } from "react";

const SelectedItemsContext = createContext(null);

export const SelectedItemsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selected, setSelected] = useState([]);

  const setSelectedItems = useCallback((items) => {
    if (items.length > 100) {
      setSelected(items.slice(0, 100));
    } else {
      setSelected(items);
    }
  }, []);

  return (
    <SelectedItemsContext.Provider value={[selected, setSelectedItems]}>
      {children}
    </SelectedItemsContext.Provider>
  );
};

export const useSelectedItems = () => useContext(SelectedItemsContext);
