import { useState, createContext, Dispatch, SetStateAction } from "react";
import { GridSortModel, GridSortItem } from "@mui/x-data-grid-pro";

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
  const [sortModel, setSortModel] = useState<GridSortModel>();

  return (
    <TableSortContext.Provider value={[sortModel, setSortModel]}>
      {children}
    </TableSortContext.Provider>
  );
};
