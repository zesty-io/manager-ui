import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  ButtonBaseActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useRef } from "react";
import { ContentItem } from "../../../../../../shell/services/types";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { useParams } from "react-router";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";

type ConfirmPublishesModalProps = {
  items: ContentItem[];
  onConfirm: (items: ContentItem[]) => void;
  onCancel: () => void;
};
export const ConfirmPublishesModal = ({
  items,
  onConfirm,
  onCancel,
}: ConfirmPublishesModalProps) => {
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const actionRef = useRef<ButtonBaseActions | null>(null);
  const onEntered = () => actionRef?.current?.focusVisible();
  const { data: fields } = useGetContentModelFieldsQuery(modelZUID);
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: files } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  return (
    <Dialog
      open
      data-cy="ConfirmPublishModal"
      PaperProps={{ sx: { width: 480 } }}
      TransitionProps={{ onEntered }}
    >
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Stack
          height={40}
          width={40}
          bgcolor="green.100"
          borderRadius="50%"
          justifyContent="center"
          alignItems="center"
          marginBottom={1.5}
        >
          <CloudUploadRoundedIcon color="success" />
        </Stack>
        <Box>Publish {items.length} Content Items:</Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          This will make the the following 2 content items immediately available
          on all of your platforms. You can always unpublish this item later if
          needed.
        </Typography>
        {items.map((item) => {
          let heroImage = (
            item?.data?.[
              fields?.find((field) => field.datatype === "images")?.name
            ] as string
          )?.split(",")?.[0];
          if (heroImage?.startsWith("3-")) {
            heroImage = files?.find((file) => file.id === heroImage)?.thumbnail;
          }
          return (
            <List disablePadding>
              <ListItem dense disableGutters divider>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: (theme) => theme.palette.grey[100],
                    }}
                    src={heroImage}
                    imgProps={{
                      style: {
                        objectFit: "contain",
                      },
                    }}
                  >
                    Null
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 600,
                    color: "text.primary",
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    noWrap: true,
                  }}
                  primary={item?.web?.metaTitle}
                  secondary={item?.web?.metaDescription}
                />
              </ListItem>
            </List>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button
          action={(actions) => (actionRef.current = actions)}
          variant="contained"
          color="success"
          sx={{ color: "common.white" }}
          onClick={() => {
            onConfirm(items);
          }}
          data-cy="ConfirmPublishButton"
        >
          Publish Items ({items.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
