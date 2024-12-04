import { FC, useContext } from "react";
import { Box, Typography } from "@mui/material";

import { StatusLabel } from "./StatusLabel";

import { WorkflowContext } from "./WorkflowsContext";

type DeactivatedLabelsProps = {
  isVisible?: boolean;
};

const DeactivatedLabels: FC<DeactivatedLabelsProps> = ({
  isVisible = false,
}) => {
  const { deactivatedStatusLabels } = useContext(WorkflowContext);

  return (
    <>
      {isVisible && (
        <Box px={4} py={1}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="stretch"
            pb={2}
          >
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Deactivated Statuses
            </Typography>
            <Typography variant="body2" fontWeight={400} color="text.secondary">
              These statuses can be re-activated at any time if you would like
              to add or remove them from content items.
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="stretch"
            rowGap={2}
          >
            {deactivatedStatusLabels.map((status) => (
              <StatusLabel key={status.sort} draggable={false} data={status} />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default DeactivatedLabels;
