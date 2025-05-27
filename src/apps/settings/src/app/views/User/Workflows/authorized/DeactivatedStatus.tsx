import { FC, useEffect, useState } from "react";
import { Box, Collapse } from "@mui/material";
import { StatusLabelSorting } from ".";
import { StatusLabel, StatusLabelLoader } from "./StatusLabel";

type DeactivatedStatusProps = {
  labels: StatusLabelSorting[];
  isLoading: boolean;
};

const DeactivatedStatus: FC<DeactivatedStatusProps> = ({
  labels,
  isLoading,
}) => {
  return (
    <Box minHeight="80px" data-cy="deactivated-labels-container">
      {isLoading ? (
        <StatusLabelLoader />
      ) : (
        <>
          {labels.map((label: StatusLabelSorting, index: number) => (
            <Collapse key={`${label.id}-${index}`} in={!label?.isFiltered}>
              <StatusLabel
                id={label.id}
                isFiltered={label?.isFiltered}
                data={label?.data}
                isDeactivated
              />
            </Collapse>
          ))}
        </>
      )}
    </Box>
  );
};

export default DeactivatedStatus;
