import {
  Box,
  ListItemButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
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
    <Tooltip
      enterDelay={500}
      enterNextDelay={500}
      disableInteractive
      placement="left"
      title={
        <Paper elevation={8}>
          {isCapturingScreenshot ? (
            <Skeleton variant="rectangular" width={400} height={300} />
          ) : (
            <Box
              component="img"
              width={400}
              height={300}
              src={(block.data?.og_image as string) || blockPlaceholder}
              loading="lazy"
              sx={{
                objectFit: "contain",
              }}
            ></Box>
          )}
        </Paper>
      }
      components={{ Tooltip: Box }}
      slotProps={{
        popper: {
          sx: {
            maxWidth: "none",
          },
        },
      }}
    >
      <ListItemButton
        divider
        selected={
          itemZUID === block.meta.ZUID ||
          Object?.values(block?.siblings || {})?.includes(itemZUID)
        }
        disableGutters
        sx={{
          position: "relative",
          overflow: "hidden",
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
            variant="body1"
            fontWeight={700}
            sx={{ wordBreak: "break-word" }}
          >
            {block?.web?.metaTitle}
          </Typography>
          <Typography
            variant="body3"
            color="text.secondary"
            mt={0.5}
            fontWeight={600}
          >
            Updated on {moment(block.web?.updatedAt).format("MMMM D")} by&nbsp;
            {updatedByUser?.firstName} {updatedByUser?.lastName}
          </Typography>
        </Box>
      </ListItemButton>
    </Tooltip>
  );
};
