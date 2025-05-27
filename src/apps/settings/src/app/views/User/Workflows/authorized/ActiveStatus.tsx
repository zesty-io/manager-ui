import { FC, useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useUpdateWorkflowStatusLabelOrderMutation } from "../../../../../../../../shell/services/instance";
import { useFormDialogContext } from "./forms-dialogs";
import { StatusLabelSorting } from ".";
import { StatusLabel, StatusLabelLoader } from "./StatusLabel";
import { UpdateSortingOrder } from "../../../../../../../../shell/services/types";

type ActiveStatusProps = {
  labels: StatusLabelSorting[];
  isLoading: boolean;
};

const ActiveStatus: FC<ActiveStatusProps> = ({ labels, isLoading = false }) => {
  const { focusedLabel } = useFormDialogContext();
  const [statusLabels, setStatusLabels] =
    useState<StatusLabelSorting[]>(labels);
  const [updateWorkflowStatusLabelOrder] =
    useUpdateWorkflowStatusLabelOrderMutation();

  const findCard = useCallback(
    (id: string) => {
      const label = statusLabels.find((c) => c.id === id);
      return { label, index: statusLabels.indexOf(label) };
    },
    [statusLabels]
  );

  const moveCard = useCallback(
    (id: string, atIndex: number) => {
      const { label, index } = findCard(id);

      if (label) {
        const updatedLabels = [...statusLabels];
        updatedLabels.splice(index, 1);
        updatedLabels.splice(atIndex, 0, label);

        setStatusLabels(updatedLabels);
      }
    },
    [findCard, statusLabels]
  );

  const onReorder = useCallback(async () => {
    const requestPayload: UpdateSortingOrder[] = statusLabels.map(
      (item, index) => ({
        ZUID: item.id,
        sort: index + 1,
      })
    );

    try {
      await updateWorkflowStatusLabelOrder(requestPayload);
    } catch (error) {
      console.error("Error during reorder:", error);
    }
  }, [statusLabels, updateWorkflowStatusLabelOrder]);

  useEffect(() => {
    if (!isLoading) {
      setStatusLabels(labels);
    }
  }, [labels, isLoading]);

  return (
    <>
      {isLoading ? (
        <StatusLabelLoader />
      ) : (
        <Box minHeight="80px" data-cy="active-labels-container">
          {statusLabels.map((label, index) => (
            <StatusLabel
              key={label.id}
              id={label.id}
              isFiltered={label.isFiltered}
              moveCard={moveCard}
              findCard={findCard}
              onReorder={onReorder}
              isFocused={focusedLabel === label.id}
              data={label.data}
            />
          ))}
        </Box>
      )}
    </>
  );
};

export default ActiveStatus;
