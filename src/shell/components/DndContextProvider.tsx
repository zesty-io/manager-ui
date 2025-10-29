import { memo, MutableRefObject, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const DndContextProvider = memo(
  ({
    containerRef,
    children,
  }: {
    containerRef: MutableRefObject<any>;
    children: React.ReactNode;
  }) => {
    const [context, setContext] = useState(null);

    useEffect(() => {
      if (!containerRef?.current) return;
      setContext(containerRef?.current);
    }, [containerRef?.current]);

    return context ? (
      <DndProvider backend={HTML5Backend} options={{ rootElement: context }}>
        {children}
      </DndProvider>
    ) : null;
  }
);

DndContextProvider.displayName = "DndContextProvider";

export default DndContextProvider;
