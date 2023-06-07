import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import growInstance from "../../../../../public/images/growInstance.svg";
import { useHistory } from "react-router";
import { useState } from "react";
import { CreateContentItemDialog } from "./CreateContentItemDialog";

export const EmptyState = () => {
  const history = useHistory();
  const [openCreateContentDialog, setOpenCreateContentDialog] = useState(false);

  return (
    <>
      <Box
        width="100%"
        display="flex"
        alignItems="center"
        gap={4}
        sx={{ px: 2, mb: 2 }}
      >
        <Box width="386px">
          <Typography variant="h4" fontWeight={600}>
            Start Growing your Instance Today
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            There are no new items or edits made in the last 30 days. Start
            creating or editing content or models or code files to see recent
            files listed here.
          </Typography>
          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateContentDialog(true)}
            >
              Content
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => history.push("/schema?triggerCreate=true")}
            >
              Model
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => history.push("/code?triggerCreate=true")}
            >
              Code File
            </Button>
          </Box>
        </Box>
        <Box>
          <img src={growInstance} />
        </Box>
      </Box>
      {openCreateContentDialog ? (
        <CreateContentItemDialog
          open={openCreateContentDialog}
          onClose={() => setOpenCreateContentDialog(false)}
        />
      ) : null}
    </>
  );
};
