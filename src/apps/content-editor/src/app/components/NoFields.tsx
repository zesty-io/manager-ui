import { Typography, Stack, Button, Box } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import { useParams, useHistory } from "react-router";
import { useSelector } from "react-redux";

import fieldsLoading from "../../../../../../public/images/fields-loading.png";
import { AppState } from "../../../../../shell/store/types";

export const NoFields = () => {
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
    >
      <Stack gap={3}>
        <Box maxWidth={540}>
          <Typography variant="h3" fontWeight={700} color="text.primary">
            Add Fields to Your Model
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This model ({model?.label}) doesn't have any fields yet. To define
            the structure of your content items,{" "}
            {products?.includes("schema")
              ? "go to your model and add fields."
              : "please contact your Administrator to add fields to this model."}
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
            Add Fields in Schema
          </Button>
        )}
      </Stack>
      <Box
        component="img"
        src={fieldsLoading}
        alt="No fields available"
        loading="lazy"
      />
    </Stack>
  );
};
