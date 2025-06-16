import { useState, FC } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@zesty-io/material";
import { CardMedia, Avatar } from "@mui/material";
import { IntegrationFieldTypes, IntegrationDisplayProps } from "../configs";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import moment from "moment-timezone";
import { getObjectValue } from "../utils";

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
const IntegrationDisplay: FC<IntegrationDisplayProps> = ({
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
        py: 0,
        pl: "28px",
        pr: "40px",
        width: "100%",
        borderRadius: 2,
        // maxHeight: type !== "details" ? "70px" : "none",
        // minHeight: "70px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "28px",
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
        <DragIndicatorRoundedIcon color="action" fontSize="small" />
      </Box>
      {!!withCardMedia && (
        <Box
          height="76px"
          boxSizing="border-box"
          position="relative"
          bgcolor="grey.50"
          width={["youtube", "video", "mux"].includes(type) ? "142px" : "76px"}
        >
          {!!preview ? (
            <CardMedia
              component="img"
              image={preview}
              sx={{
                flexGrow: 0,
                height: "100%",
                width: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Box
              component={mediaIcon}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 0,
                color: "grey.400",
                "& svg": {
                  fontSize: "small",
                  fill: "grey.400",
                },
              }}
            />
          )}
        </Box>
      )}
      <CardContent
        sx={{
          height: "100%",
          flexGrow: 1,
          p: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            position: "relative",
            boxSizing: "border-box",
            py: 2,
            pl: 2,
            pr: 1,
            rowGap: 0.5,
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              noWrap
              textOverflow="ellipsis"
              flexGrow={1}
            >
              {heading || "Add Heading"}
            </Typography>
            {type === "shopify" && (
              <Typography
                variant="body2"
                flexGrow={0}
                textAlign="right"
                width="fit-content"
                noWrap
              >
                {detail || "Add Detail"}
              </Typography>
            )}
          </Box>
          {type === "simple" ? null : type === "details" ? (
            <Details
              paths={[...(!!details?.length ? details : [""])]}
              data={data}
            />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              textOverflow="ellipsis"
              width="100%"
            >
              {subHeading || "Add Sub-heading"}
            </Typography>
          )}
        </Box>
      </CardContent>

      {!!withsourceIcon && (
        <Box
          sx={{
            width: "40px",
            height: "100%",
            display: "grid",
            placeContent: "center",
            flexGrow: 0,
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
        </Box>
      )}

      <Box
        sx={{
          width: "40px",
          height: "100%",
          display: "grid",
          placeContent: "center",
          flexGrow: 0,
          pr: "16px",
          pl: "8px",
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
          <MoreHorizIcon color="action" />
        </CardActionArea>
      </Box>
    </Card>
  );
};

export default IntegrationDisplay;
