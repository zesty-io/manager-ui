import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Stack,
  Box,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import moment from "moment-timezone";
import { useSelector } from "react-redux";
import { ContentItem } from "../../../../../../shell/services/types";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { AppState } from "../../../../../../shell/store/types";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../../shell/services/mediaManager";
import { useParams } from "react-router";
import { FieldTypeDateTime } from "../../../../../../shell/components/FieldTypeDateTime";

type SchedulePublishesModalProps = {
  items: ContentItem[];
  onCancel: () => void;
  onConfirm: (items: ContentItem[], publishDateTime?: string) => void;
};
export const SchedulePublishesModal = ({
  onCancel,
  items,
  onConfirm,
}: SchedulePublishesModalProps) => {
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const [publishDateTime, setPublishDateTime] = useState(
    moment().minute(0).second(0).add(1, "hours").format("yyyy-MM-DD HH:mm:ss")
  );
  const [publishTimezone, setPublishTimezone] = useState(
    moment.tz.guess() ?? "America/Los_Angeles"
  );

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

  const isSelectedDatetimePast = moment
    .utc(moment.tz(publishDateTime, publishTimezone))
    .isBefore(moment.utc());

  return (
    <Dialog
      open
      PaperProps={{
        sx: {
          maxWidth: 640,
          width: 640,
        },
      }}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ScheduleRoundedIcon color="warning" />
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" fontWeight={700}>
                Schedule Publish of Changes to {items.length} Items
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              You can always cancel the publish later if needed
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent data-cy="PublishScheduleModal">
        <>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            Publish on
          </Typography>
          <FieldTypeDateTime
            disablePast
            showTimezonePicker
            showClearButton={false}
            name="publishDateTime"
            value={publishDateTime}
            selectedTimezone={publishTimezone}
            onChange={(datetime: any) => {
              setPublishDateTime(datetime);
            }}
            onTimezoneChange={(timezone: any) => {
              setPublishTimezone(timezone);
            }}
          />
          {isSelectedDatetimePast && (
            <Alert
              severity="warning"
              icon={<WarningRoundedIcon fontSize="inherit" />}
              sx={{
                mt: 2.5,
              }}
            >
              Since the selected time is a current or past date, this will be
              immediately published.
            </Alert>
          )}
          {items.map((item) => {
            let heroImage = (
              item?.data?.[
                fields?.find((field) => field.datatype === "images")?.name
              ] as string
            )?.split(",")?.[0];
            if (heroImage?.startsWith("3-")) {
              heroImage = files?.find(
                (file) => file.id === heroImage
              )?.thumbnail;
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
                      <Typography variant="body2" color="text.secondary">
                        NA
                      </Typography>
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
        </>
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="CancelSchedulePublishButton"
          variant="text"
          color="inherit"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <LoadingButton
          data-cy="SchedulePublishButton"
          variant="contained"
          startIcon={<ScheduleRoundedIcon />}
          onClick={() => {
            if (isSelectedDatetimePast) {
              onConfirm(items);
            } else {
              onConfirm(
                items,
                moment
                  .utc(moment.tz(publishDateTime, publishTimezone))
                  .format("YYYY-MM-DD HH:mm:ss")
              );
            }
          }}
        >
          Schedule Publish ({items.length})
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
