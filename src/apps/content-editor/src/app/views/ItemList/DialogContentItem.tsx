import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stack,
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
import { ImageRounded } from "@mui/icons-material";

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

  const imageFields = useMemo(() => {
    if (!fields?.length) return [];

    return fields?.filter((field) => field.datatype === "images");
  }, [fields]);

  const heroImage = useMemo(() => {
    if (!imageFields?.length || !item?.data) return null;

    let image = String(item.data[imageFields[0]?.name])?.split(",")?.[0];

    if (image?.startsWith("3-")) {
      image = files?.find((file) => file.id === image)?.thumbnail;
    }

    return image;
  }, [imageFields, item, files]);

  return (
    <List disablePadding>
      <ListItem dense disableGutters divider sx={{ minHeight: 49 }}>
        {!!imageFields?.length && <HeroImage imageURL={heroImage} />}
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
          primary={
            item?.web?.metaTitle || item?.web?.metaLinkText || item?.meta?.ZUID
          }
          secondary={item?.web?.metaDescription}
          sx={{ ml: !imageFields?.length ? 2 : 0 }}
        />
      </ListItem>
    </List>
  );
};

type HeroImageProps = {
  imageURL: string;
};
const HeroImage = ({ imageURL }: HeroImageProps) => {
  if (imageURL) {
    return (
      <ListItemAvatar>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: (theme) => theme.palette.grey[100],
          }}
          src={imageURL}
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
    );
  }

  return (
    <Stack
      sx={{
        backgroundColor: "grey.100",
        width: 40,
        height: 40,
        minWidth: 40,
        minHeight: 40,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        mr: 2,
        my: 0.5,
        borderRadius: 1,
      }}
    >
      <ImageRounded fontSize="small" color="action" />
    </Stack>
  );
};
