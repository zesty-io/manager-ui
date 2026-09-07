import { Typography, Stack, Button, Box } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useParams, useHistory } from "react-router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import fieldsLoading from "../../../../../../public/images/fields-loading.png";
import { AppState } from "../../../../../shell/store/types";

export const NoFields = () => {
  const { t } = useTranslation("content");
  const history = useHistory();
  const { modelZUID } = useParams<{
    modelZUID: string;
  }>();
  const { products } = useSelector((state: AppState) => state.products);
  const model = useSelector((state: AppState) => state.models[modelZUID]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      columnGap={4}
    >
      <Stack gap={3}>
        <Box maxWidth={540}>
          <Typography variant="h3" fontWeight={700} color="text.primary">
            {t("content.addFieldsTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {products?.includes("schema")
              ? t("content.noFieldsDescriptionWithSchema", {
                  label: model?.label,
                })
              : t("content.noFieldsDescriptionNoSchema", {
                  label: model?.label,
                })}
          </Typography>
        </Box>
        {products?.includes("schema") && (
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            size="small"
            sx={{ width: "fit-content" }}
            onClick={() => {
              history.push(`/schema/${modelZUID}/fields?addNewField=true`);
            }}
          >
            {t("content.addFieldsInSchemaButton")}
          </Button>
        )}
      </Stack>
      <Box
        component="img"
        src={fieldsLoading}
        alt={t("content.noFieldsImageAlt")}
        loading="lazy"
      />
    </Stack>
  );
};
