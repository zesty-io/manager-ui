import { memo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const DndContextProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <DndProvider backend={HTML5Backend} context={window}>
        {children}
      </DndProvider>
    );
  }
);

DndContextProvider.displayName = "DndContextProvider";

export default DndContextProvider;
