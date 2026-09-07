import { Box, Button, Typography, Container } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import emptyItemsList from "../../../../../../../public/images/emptyItemsList.png";
import { useHistory, useParams } from "react-router";

export const ItemListEmpty = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { modelZUID } = useParams<{ modelZUID: string }>();
  return (
    <Container maxWidth="lg" disableGutters sx={{ height: "100%" }}>
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent={"space-between"}
        gap={8}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t("content.itemListEmptyTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
            {t("content.itemListEmptyDescription")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            size="small"
            onClick={() => {
              history.push(`/content/${modelZUID}/new`);
            }}
          >
            {t("common.create")}
          </Button>
        </Box>
        <Box component="img" src={emptyItemsList} />
      </Box>
    </Container>
  );
};
