import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Stack,
} from "@mui/material";
import { DeleteRounded } from "@mui/icons-material";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ContentItem } from "../../../../../../../../shell/services/types";
import {
  useDeleteContentItemMutation,
  useGetContentModelFieldsQuery,
} from "../../../../../../../../shell/services/instance";
import { Box } from "@mui/system";
import { LoadingButton } from "@mui/lab";

type DuplicateItemProps = {
  onClose: () => void;
};

export const DeleteItemDialog = ({ onClose }: DuplicateItemProps) => {
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const history = useHistory();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );

  const [deleteContentItem, { isLoading }] = useDeleteContentItemMutation();

  return (
    <Dialog open fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DeleteRounded color="error" />
        </Box>
        <Stack mt={1.5} display="inline">
          Delete Content Item:
          <Typography variant="inherit" fontWeight={600}>
            {" "}
            {item?.web?.metaTitle || item?.web?.metaLinkText}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Deleting this item will remove it from all locations throughout your
          site and make it unavailable to API requests. This cannot be undone.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          color="error"
          onClick={() => {
            deleteContentItem({
              modelZUID: modelZUID,
              itemZUID: itemZUID,
            }).then(() => {
              /**
               * Remove the item from the store before redirecting
               */
              dispatch({
                type: "REMOVE_ITEM",
                itemZUID,
              });
              history.push(`/content/${modelZUID}`);
            });
          }}
          loading={isLoading}
        >
          Delete Item
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
