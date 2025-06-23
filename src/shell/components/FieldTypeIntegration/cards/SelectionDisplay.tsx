import { useState, FC } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@zesty-io/material";
import { CardMedia, Avatar, Checkbox } from "@mui/material";
// import { SelectionDisplayType } from "../configs";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import moment from "moment-timezone";
import { getObjectValue } from "../utils";
import DataObjectIcon from "@mui/icons-material/DataObject";
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
  type,
  heading = "Add Heading",
  subHeading = "Add Sub-heading",
  preview,
  detail = "Add Detail",
  details,
  data,
}) => {
  const [selectedCard, setSelectedCard] = useState(0);

  const withCardMedia = [
    "image",
    "video",
    "shopify",
    "youtube",
    "mux",
  ].includes(type);

  const withsourceIcon = ["shopify", "youtube", "mux", "classy"].includes(type);

  const mediaIcon =
    type === "image" ? AddPhotoAlternateRoundedIcon : VideoCallRoundedIcon;

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{
        borderColor: "border",
        display: "-webkit-box",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
        pl: "54px",
        pr: "58px",
        width: "100%",
        height: "96px",
        borderRadius: 0,
        // maxHeight: type !== "details" ? "70px" : "none",
        // minHeight: "70px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "54px",
          height: "100%",
          display: "grid",
          placeContent: "center",
          flexGrow: 0,
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* <DragIndicatorRoundedIcon color="action" fontSize="small" /> */}
        <Checkbox />
      </Box>

      <CardContent
        sx={{
          height: "100%",
          width: "100%",
          flexGrow: 1,
          p: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 142, borderRadius: "12px", flexGrow: 0 }}
          image="/images/media-sample-image.png"
          alt="Live from space album cover"
        />

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          // width="100%"
          flexGrow={1}
          sx={{
            height: "100%",
            rowGap: 0.25,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color="text.primary"
            noWrap
            textOverflow="ellipsis"
            flexGrow={1}
            width="100%"
            height="20px"
            maxHeight="22px"
            px={2}
          >
            Chugging through Sri Lanka's tea plantations
          </Typography>
          <Typography
            px={2}
            variant="body2"
            fontWeight={400}
            color="text.primary"
            noWrap
            textOverflow="ellipsis"
            flexGrow={1}
            width="100%"
            height="20px"
            maxHeight="22px"
          >
            13:10 • 1 month ago
          </Typography>
        </Box>
      </CardContent>

      <Box
        sx={{
          width: "58px",
          height: "100%",
          display: "grid",
          placeContent: "center",
          flexGrow: 0,

          pr: "16px",
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <CardActionArea
          sx={{
            flexGrow: 0,
            width: "28px",
            height: "28px",

            display: "grid",
            placeContent: "center",
            borderRadius: 2,
          }}
          onClick={() => setSelectedCard(1)}
        >
          <DataObjectIcon color="action" />
        </CardActionArea>
      </Box>
    </Card>
  );
};

export default SelectionDisplay;
