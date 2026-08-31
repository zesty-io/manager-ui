import { alpha } from "@mui/material/styles";
import { memo, useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { ConfirmDialog, theme } from "@zesty-io/material";

import { deleteItem } from "shell/store/content";
import { unpinTab } from "shell/store/ui";

export const WidgetDeleteItem = memo(function WidgetDeleteItem(props) {
  const history = useHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <Card sx={{ mb: 3, backgroundColor: "transparent" }} elevation={0}>
        <CardHeader
          sx={{
            p: 0,
            backgroundColor: "transparent",
            color: alpha(theme.palette.text.primary, 0.4),
            borderBottom: 1,
            borderColor: "grey.200",
          }}
          titleTypographyProps={{
            variant: "overline",
            sx: {
              fontWeight: 400,
              color: "text.primary",
              textTransform: "uppercase",
            },
          }}
          title={`Delete ${props?.altText || "Item"}`}
        ></CardHeader>
        <CardContent
          sx={{
            p: 0,
            pt: 2,
            "&:last-child": {
              pb: 0,
            },
          }}
        >
          {props.isLoadingItem ? (
            <Box>
              <Stack gap={1.25} mb={4}>
                <Skeleton variant="rounded" width="100%" height={20} />
                <Skeleton variant="rounded" width={259} height={20} />
                <Skeleton variant="rounded" width={200} height={20} />
              </Stack>
              <Skeleton variant="rounded" width={137} height={32} />
            </Box>
          ) : (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: "595px",
                }}
              >
                Delete this content? Removing it from all locations throughout
                your site and making it unavailable to API requests.
              </Typography>
              <Button
                variant="contained"
                color="error"
                type="warn"
                id="DeleteItemButton"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                startIcon={
                  deleting ? <CircularProgress size="20px" /> : <DeleteIcon />
                }
                disableElevation
                sx={{
                  mt: 1.5,
                }}
              >
                Delete {props?.altText || "Item"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        title={`Are you sure you want to delete the item:
    ${props.metaTitle}`}
      >
        <Button
          variant="outlined"
          id="deleteCancelButton"
          onClick={() => setConfirmOpen(false)}
          startIcon={<DoDisturbAltIcon />}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          id="deleteConfirmButton"
          onClick={() => {
            setConfirmOpen(false);
            setDeleting(true);
            props
              .dispatch(deleteItem(props.modelZUID, props.itemZUID))
              .then((res) => {
                if (res.status === 200) {
                  const { pathname, search } = history.location;
                  props.dispatch(unpinTab({ pathname, search }));
                  history.push("/content/" + props.modelZUID);
                } else {
                  // if delete fails, component is still mounted, so we can set state
                  setDeleting(false);
                }
              });
          }}
          startIcon={<DeleteIcon />}
        >
          Delete Item
        </Button>
      </ConfirmDialog>
    </>
  );
});
