import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  DialogContent,
  TextField,
  InputLabel,
} from "@mui/material";
import { DriveFileRenameOutlineRounded } from "@mui/icons-material";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ContentItem } from "../../../../../../../../shell/services/types";
import {
  useGetContentModelsQuery,
  useUpdateContentItemMutation,
} from "../../../../../../../../shell/services/instance";
import { fetchItem } from "../../../../../../../../shell/store/content";
import { useTranslation } from "react-i18next";

type DuplicateItemProps = {
  onClose: () => void;
};

export const RenameItemDialog = ({ onClose }: DuplicateItemProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const history = useHistory();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );
  const [newTitle, setNewTitle] = useState(item?.web?.metaTitle || "");

  const [updateContentItem, { isLoading }] = useUpdateContentItemMutation();
  const { refetch: refetchContentModels } = useGetContentModelsQuery();

  return (
    <Dialog open fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle component="div">
        <Box
          sx={{
            backgroundColor: "blue.50",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DriveFileRenameOutlineRounded color="info" />
        </Box>
        <Typography variant="h5" fontWeight={700} mt={1.5}>
          {t("content.itemEditRenameVariant")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("content.itemEditRenameVariantDescription")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel>{t("content.itemEditVariantTitle")}</InputLabel>
        <TextField
          fullWidth
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            updateContentItem({
              modelZUID: modelZUID,
              itemZUID: itemZUID,
              body: {
                ...item,
                web: {
                  ...item.web,
                  metaTitle: newTitle,
                },
              },
            }).then(() => {
              dispatch(fetchItem(modelZUID, itemZUID));
              refetchContentModels();
              onClose();
            });
          }}
          loading={isLoading}
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
