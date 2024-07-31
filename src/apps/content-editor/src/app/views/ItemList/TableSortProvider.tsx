import { useState, createContext, useLayoutEffect } from "react";
import { GridSortModel, GridSortItem } from "@mui/x-data-grid-pro";
import { useParams as useRouterParams } from "react-router";

type TableSortContextType = [
  GridSortModel,
  (newSortModel: GridSortModel) => void
];
export const TableSortContext = createContext<TableSortContextType>([
  [],
  () => {},
]);

type TableSortProviderType = {
  children?: React.ReactNode;
};
export const TableSortProvider = ({ children }: TableSortProviderType) => {
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();

  useLayoutEffect(() => {
    if (!modelZUID) return;

    const stateFromLocalStorage = localStorage?.getItem(
      `${modelZUID}-dataGridState`
    );

    if (stateFromLocalStorage) {
      const { sortModel: sortModelFromLocalStorage } = JSON.parse(
        stateFromLocalStorage
      )?.sorting;

      if (
        Array.isArray(sortModelFromLocalStorage) &&
        sortModelFromLocalStorage?.length
      ) {
        setSortModel(sortModelFromLocalStorage);
      }
    }
  }, [modelZUID]);

  return (
    <TableSortContext.Provider value={[sortModel, setSortModel]}>
      {children}
    </TableSortContext.Provider>
  );
};
