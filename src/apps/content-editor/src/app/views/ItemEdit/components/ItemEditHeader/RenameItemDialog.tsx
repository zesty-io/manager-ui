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
import { useUpdateContentItemMutation } from "../../../../../../../../shell/services/instance";
import { fetchItem } from "../../../../../../../../shell/store/content";

type DuplicateItemProps = {
  onClose: () => void;
};

export const RenameItemDialog = ({ onClose }: DuplicateItemProps) => {
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
          Rename Variant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This will update the variant title that is shown to content editors
        </Typography>
      </DialogTitle>
      <DialogContent>
        <InputLabel>Variant Title</InputLabel>
        <TextField
          fullWidth
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
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
              onClose();
            });
          }}
          loading={isLoading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
