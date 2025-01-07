import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  InputLabel,
  TextField,
  DialogActions,
} from "@mui/material";
import { ModeEditRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { ContentModel } from "../../../shell/services/types";
import { createItem, generateItem } from "../../../shell/store/content";
import { useDispatch, useSelector } from "react-redux";
import { selectSortedModelFields } from "../../content-editor/src/app/views/ItemCreate/ItemCreate";
import { useHistory } from "react-router";
import { useGetContentModelFieldsQuery } from "../../../shell/services/instance";

export const CreateVariantDialog = ({
  onClose,
  model,
}: {
  onClose: () => void;
  model: ContentModel;
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [variantName, setVariantName] = useState("Untitled");
  const [isLoading, setIsLoading] = useState(false);
  const { data: fields, isFetching: isFieldsLoading } =
    useGetContentModelFieldsQuery(model?.ZUID);

  const handleVariantCreate = async () => {
    setIsLoading(true);
    const initialData: { [key: string]: any } = fields?.reduce((accu, curr) => {
      if (!curr.deletedAt) {
        accu[curr.name] =
          curr?.settings?.defaultValue !== null &&
          curr?.settings?.defaultValue !== undefined
            ? curr?.settings?.defaultValue
            : null;
      }
      return accu;
    }, {} as { [key: string]: any });
    await dispatch(
      generateItem(model?.ZUID, initialData, {
        metaTitle: variantName,
      })
    );
    const res = await dispatch(
      createItem({
        modelZUID: model.ZUID,
        itemZUID: `new:${model.ZUID}`,
        skipPathPartValidation: true,
      })
    );

    // @ts-ignore
    history.push(`/blocks/${model.ZUID}/${res.data.ZUID}`);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "deepOrange.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <ModeEditRounded color="primary" />
        </Box>
        Create Variant of {model?.label}
      </DialogTitle>
      <DialogContent>
        <InputLabel sx={{ mb: 0.5 }}>Variant Name</InputLabel>
        <TextField
          autoFocus
          value={variantName}
          onChange={(event) => setVariantName(event.target.value)}
          fullWidth
          data-cy="variant-name-input"
          onFocus={(evt) => evt.target.select()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          disabled={!variantName || isFieldsLoading}
          onClick={handleVariantCreate}
          loading={isLoading}
          variant="contained"
          data-cy="create-variant-confirm-button"
        >
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
