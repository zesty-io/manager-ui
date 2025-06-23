import { useState, FC } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  CardMedia,
  Avatar,
  Checkbox,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";
// import { SelectionDisplayType } from "../configs";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import moment from "moment-timezone";
import { getObjectValue } from "../utils";
import DataObjectIcon from "@mui/icons-material/DataObject";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
type DetailsProps = Record<string, string | number>;

const Details = ({ paths, data }: { paths: string[]; data: any }) => {
  if (!paths?.length) return null;
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {paths.map((path, i) => {
        const itemValue = getObjectValue(data, path);
        return (
          <Box
            key={i}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            <Typography
              variant="body2"
              color="text.primary"
              flexGrow={1}
              flexShrink={1}
              textOverflow="ellipsis"
              overflow="hidden"
              noWrap
              maxWidth="60%"
            >
              {path || `+ Add Detail`}
            </Typography>
            {!!itemValue && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                textOverflow="ellipsis"
                overflow="hidden"
                noWrap
                maxWidth="40%"
                flexGrow={0}
                flexShrink={0}
              >
                {itemValue}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
const SelectionDisplay: FC<any> = ({
  id,
  type,
  heading = "Add Heading",
  subHeading = "Add Sub-heading",
  preview,
  detail = "Add Detail",
  details,
  data,
  isSelected,
  onSelect,
}) => {
  const withsourceIcon = ["shopify", "youtube", "mux", "classy"].includes(type);
  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        py: 1,
        pl: "54px",
        pr: "58px",
        width: "100%",
        height: "96px",

        borderRadius: 0,

        position: "relative",
        outline: "1px solid",
        outlineColor: "border",
        "& *": {
          boxSizing: "border-box",
        },
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelect(e.target.checked, id)}
        sx={{
          color: "action.active",
          position: "absolute",
          left: 8,
        }}
      />

      <CardContent
        sx={{
          width: "100%",
          height: "100%",
          p: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid
          container
          spacing={1}
          width="100%"
          height="100%"
          sx={{ position: "relative", boxSizing: "border-box" }}
        >
          <Grid
            size={3}
            height="100%"
            sx={{
              position: "relative",
            }}
          >
            <CardMedia
              component="img"
              height="100%"
              width="100%"
              sx={{
                borderRadius: 2,
                flexGrow: 0,
                bgcolor: "grey.100",
              }}
              image="/images/media-sample-image.png"
              alt="Live from space album cover"
            />
            <PlayCircleIcon
              fontSize="large"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                color: "common.white",
              }}
            />
          </Grid>
          <Grid size="grow">
            <Stack
              spacing="4px"
              direction="column"
              justifyContent="center"
              width="100%"
              height="100%"
              p={2}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                color="text.primary"
                noWrap
                textOverflow="ellipsis"
                width="100%"
              >
                Chugging through Sri Lanka's tea plantations Chugging through
                Sri Lanka's tea plantations Chugging through Sri Lanka's tea
                plantations
              </Typography>
              <Typography
                variant="body2"
                fontWeight={400}
                color="text.secondary"
                noWrap
                textOverflow="ellipsis"
                width="100%"
              >
                13:10 • 1 month ago Chugging through Sri Lanka's tea plantations
                Chugging through Sri Lanka's tea plantations
              </Typography>
            </Stack>
          </Grid>
          {!!withsourceIcon && (
            <Grid
              size={1}
              height="100%"
              border="1px solid red"
              sx={{
                border: "1px solid red",
                height: "100%",
                display: "grid",
                placeContent: "center",
              }}
            >
              <Avatar
                src={`/images/${type}Icon.svg`}
                variant="square"
                sizes="small"
                sx={{
                  width: "32px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>

      <IconButton
        sx={{
          borderRadius: 1,
          color: "action.active",
          position: "absolute",
          right: 16,
        }}
        // onClick={() => setSelectedCard(1)}
      >
        <DataObjectIcon color="action" sx={{ color: "action.active" }} />
      </IconButton>
    </Card>
  );
};

export default SelectionDisplay;
