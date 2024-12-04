import { FC, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import * as WorkflowStatus from "./constants";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { DragAndDropArea } from "./dnd/DragAndDropArea";
import { useWorkflowStatus } from "./WorkflowsContext";
import { NoResults } from "./NoResults";

type ActiveLabelsProps = {
  visibleHeader?: boolean;
};

const ActiveLabels: FC<ActiveLabelsProps> = ({ visibleHeader = false }) => {
  const [statusLabels, setStatusLabels] = useState<
    WorkflowStatus.StatusLabelProps[]
  >([]);

  const { activeStatusLabels, searchValue, setSearchValue } =
    useWorkflowStatus();

  useEffect(() => {
    if (!activeStatusLabels) return setStatusLabels([]);
    if (!searchValue) return setStatusLabels(activeStatusLabels);
    const filteredData = activeStatusLabels.filter(
      (item: WorkflowStatus.StatusLabelProps) => {
        const itemSearchString =
          (item.name?.toLowerCase() ?? "") +
          "_" +
          (item.description?.toLowerCase() ?? "");
        return itemSearchString.includes(searchValue.toLowerCase());
      }
    );

    setStatusLabels(filteredData);
  }, [activeStatusLabels, searchValue]);

  return (
    <Box width="100%" height={!statusLabels?.length ? "100%" : "auto"} pb={1}>
      {visibleHeader && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="stretch"
          px={4}
          pb={1}
        >
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Active Statuses
          </Typography>
          <Typography variant="body2" fontWeight={400} color="text.secondary">
            Active statuses are available to be added and removed from content
            items.
          </Typography>
        </Box>
      )}
      {!statusLabels?.length ? (
        <Box
          width="100%"
          height="100%"
          sx={{ display: "grid", placeContent: "center" }}
        >
          <NoResults
            onButtonClick={() => setSearchValue("")}
            searchTerm={searchValue}
          />
        </Box>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <DragAndDropArea listData={statusLabels} />
        </DndProvider>
      )}
    </Box>
  );
};

export default ActiveLabels;
