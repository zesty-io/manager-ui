import { Box, ListItemButton, Skeleton, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useHistory, useParams } from "react-router";
import { useSelector } from "react-redux";
import moment from "moment-timezone";

import { AppState } from "../../../../../../../../shell/store/types";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import blockPlaceholder from "../../../../../../../../../public/images/blockPlaceholder.png";
import { ContentItem } from "../../../../../../../../shell/services/types";

export const BlockVariantCard = ({ block }: { block: ContentItem }) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const isCapturingScreenshot =
    useSelector(
      (state: AppState) => state.content?.[block.meta.ZUID]?.capturingScreenshot
    ) || false;
  const { data: users } = useGetUsersQuery();
  const updatedByUser = users?.find(
    (user) => user.ZUID === block.web?.createdByUserZUID
  );
  const imageRef = useRef(null);
  const [isErrored, setIsErrored] = useState(false);

  return (
    <ListItemButton
      divider
      selected={
        itemZUID === block.meta.ZUID ||
        Object?.values(block?.siblings || {})?.includes(itemZUID)
      }
      disableGutters
      sx={{
        display: "grid",
        position: "relative",
        overflow: "hidden",
        gridTemplateColumns: "187px 1fr",
        px: 2,
        py: 1.75,
        gap: "0px 12px",
        "&.Mui-selected": {
          "&:first-of-type": {
            borderBottomColor: "primary.main",
          },
          "&:not(:last-of-type)": {
            borderBottomColor: "primary.main",
          },
        },
      }}
      onClick={() => history.push(`/blocks/${modelZUID}/${block.meta.ZUID}`)}
    >
      {!!isCapturingScreenshot ? (
        <Skeleton
          variant="rectangular"
          width={187}
          height={120}
          sx={{ flexShrink: 0, borderRadius: "8px" }}
        />
      ) : (
        <Box
          ref={imageRef}
          // This make it so that if the image errored it would retry on next organic render
          key={isErrored ? Date.now() : ""}
          component="img"
          width={187}
          height={120}
          sx={{
            objectFit: "contain",
            borderRadius: "8px",
            backgroundColor: "grey.200",
            flexShrink: 0,
          }}
          src={(block.data?.og_image as string) || blockPlaceholder}
          onError={() => {
            setIsErrored(true);
            imageRef.current.src = blockPlaceholder;
          }}
        ></Box>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          overflow: "hidden",
        }}
      >
        <Typography
          noWrap
          variant="body1"
          fontWeight={700}
          sx={{
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {block?.web?.metaTitle}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mt={0.5}
          fontWeight={600}
        >
          Updated on {moment(block.web?.updatedAt).format("MMMM D")} by{" "}
          {updatedByUser?.firstName} {updatedByUser?.lastName}
        </Typography>
      </Box>
    </ListItemButton>
  );
};
