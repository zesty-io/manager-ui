import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { ContentItem } from "../../../../../../shell/services/types";
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { useParams } from "react-router";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../../shell/services/mediaManager";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useMemo } from "react";

export type DialogContentItemProps = {
  item: ContentItem;
};

export const DialogContentItem = ({ item }: DialogContentItemProps) => {
  const { modelZUID } = useParams<{ modelZUID: string }>();
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
  const heroImage = useMemo(() => {
    let image = (
      item?.data?.[
        fields?.find((field) => field.datatype === "images")?.name
      ] as string
    )?.split(",")?.[0];
    if (image?.startsWith("3-")) {
      image = files?.find((file) => file.id === image)?.thumbnail;
    }

    return image;
  }, [fields, item, files]);

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
};
