import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import growInstance from "../../../../../public/images/growInstance.svg";
import { useHistory } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateContentItemDialog } from "../../../../shell/components/CreateContentItemDialog";

export const EmptyState = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [openCreateContentDialog, setOpenCreateContentDialog] = useState(false);

  return (
    <>
      <Box
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={4}
        sx={{ px: 2, mb: 2 }}
      >
        <Box width="386px">
          <Typography variant="h4" fontWeight={600}>
            {t("dashboard.emptyStateTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {t("dashboard.emptyStateDescription")}
          </Typography>
          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateContentDialog(true)}
            >
              {t("common.content")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => history.push("/schema?triggerCreate=true")}
            >
              {t("common.model")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => history.push("/code?triggerCreate=true")}
            >
              {t("common.codeFile")}
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
