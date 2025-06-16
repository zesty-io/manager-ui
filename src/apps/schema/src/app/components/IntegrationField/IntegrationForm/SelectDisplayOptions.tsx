import { FC, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Box,
  Slide,
  Stack,
  Typography,
  Link,
  InputAdornment,
  Grid,
  Paper,
  Avatar,
  alpha,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { isNull } from "lodash";
import SearchIcon from "@mui/icons-material/SearchRounded";
import { FormWrapper } from ".";
import { useIntegrationField } from "../IntegrationFieldProvider";
import DisplayTypes from "../cards";

import { IntegrationFieldTypes, IntegrationDisplayProps } from "../configs";
import IntegrationDisplay from "../cards";
import IntegrationField from "..";

const GENERIC_DISPLAY_TYPES: DisplayOptionCardProps[] = [
  {
    title: "Text Card",
    description: "Display items with a heading and subheading",
    card: {
      type: "text",
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "The beautiful train from Kandy to Ella",
    },
  },
  {
    title: "Image Card",
    description: "Display items with an image, heading, and subheading.",
    card: {
      type: "image",
      heading: "Washington-state-mountain.jpg",
      subHeading: "A photo of a beautiful mountain in the state of Washington",
      preview: "/images/shopify-sample-image.png",
    },
  },
  {
    title: "Video Card",
    description: "Display Shopify product listings",
    card: {
      type: "video",
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "13:10",
      preview: "/images/media-sample-image.png",
    },
  },
  {
    title: "Details Card",
    description: "Display items with multiple details",
    card: {
      type: "details",
      heading: "Anfernee Simons",
      subHeading: "A photo of a beautiful mountain in the state of Washington",
      details: ["position", "stats.points"],
    },
  },
  {
    title: "Simple Card",
    description: "Display items with a heading and subheading",
    card: {
      type: "simple",
      heading: "Lebron James",
    },
  },
];

const SPECIAL_DISPLAY_TYPES: DisplayOptionCardProps[] = [
  {
    title: "MUX Card",
    description: "Display videos from MUX",
    card: {
      type: "mux",
      heading: "HK01Bq7FrEQmIu3QpRiZZ98HQOOZjm6BYyg17eEunlyo",
      subHeading: "13:10",
      preview: "/images/media-sample-image.png",
    },
  },
  {
    title: "Youtube Card",
    description: "Display videos from Youtube",
    card: {
      type: "youtube",
      heading: "Chugging through Sri Lanka's tea plantations",
      subHeading: "13:10 • 92M views • 1 day ago",
      preview: "/images/media-sample-image.png",
    },
  },
  {
    title: "Shopify Card",
    description: "Display Shopify product listings",
    card: {
      type: "shopify",
      heading: "Basic Chair",
      subHeading: "Furniture",
      detail: "$73.00",
      preview: "/images/shopify-sample-image.png",
    },
  },
  {
    title: "Classy Card",
    description: "Display campaigns from classy",
    card: {
      type: "classy",
      heading: "Campaign Name",
      subHeading: "Campaign Description",
    },
  },
];

export type DisplayOptionCardProps = {
  title: string;
  description?: string;
  card: IntegrationDisplayProps;
  disabled?: boolean;
};

const SelectDisplayOptions = () => {
  const [open, setOpen] = useState(false);
  const [recommendedType, setRecommendedType] =
    useState<IntegrationFieldTypes | null>(null);

  const {
    setActiveStep,
    closeForm,
    endpoint,
    type,
    setType,
    // setIntegrationConfig,
  } = useIntegrationField();

  const recommendedOption = SPECIAL_DISPLAY_TYPES.filter(
    (option) => option.card.type === recommendedType
  );

  const disabledOptions = SPECIAL_DISPLAY_TYPES.filter(
    (option) => option.card.type !== recommendedType
  );

  useEffect(() => {
    if (endpoint?.includes("mux.com")) return setRecommendedType("mux");
    if (endpoint?.includes("youtube.com")) return setRecommendedType("youtube");
    if (endpoint?.includes("shopify.com")) return setRecommendedType("shopify");
    if (endpoint?.includes("classy.org")) return setRecommendedType("classy");
    setRecommendedType(null);
  }, [endpoint]);

  useEffect(() => {
    if (!!recommendedType) setType(recommendedType);
  }, [recommendedType]);

  return (
    <FormWrapper height="calc(100vh - 40px)" width="1200px">
      <DialogTitle component="div" flexGrow={0} p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box width={520}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              Select a Display Type
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This can be re-configured later
            </Typography>
          </Box>
          <IconButton size="small" onClick={closeForm}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        data-cy="starter-blocks-selection-dialog"
        sx={{
          py: "0px !important",
          backgroundColor: "grey.50",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          rowGap: 2,
          overflowY: "auto",
          overflowX: "hidden",
          flexGrow: 1,
          position: "relative",
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.300",
            borderRadius: "4px",
          },
        }}
        // dividers
      >
        <Box
          sx={{
            py: 2.5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "stretch",
            rowGap: 1.25,
          }}
        >
          {!!recommendedOption?.length && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
                rowGap: 1.25,
              }}
            >
              <Typography
                variant="body2"
                width="100%"
                color="text.secondary"
                textTransform="uppercase"
                py={1}
              >
                RECOMMENDED
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "stretch",
                  rowGap: 1.5,
                }}
              >
                {recommendedOption?.map((item) => (
                  <DisplayOptionCard
                    key={item?.title}
                    title={item?.title}
                    description={item?.description}
                    card={item?.card}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "stretch",
              rowGap: 1.25,
            }}
          >
            <Typography
              variant="body2"
              width="100%"
              color="text.secondary"
              textTransform="uppercase"
              py={1}
            >
              {!!recommendedOption?.length ? "OTHER OPTIONS" : "OPTIONS"}
            </Typography>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
                rowGap: 1.5,
              }}
            >
              {GENERIC_DISPLAY_TYPES?.map((item) => (
                <DisplayOptionCard
                  key={item?.title}
                  title={item?.title}
                  description={item?.description}
                  card={item?.card}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "stretch",
              rowGap: 1.25,
            }}
          >
            <Typography
              variant="body2"
              width="100%"
              color="text.secondary"
              textTransform="uppercase"
              py={1}
            >
              {!!recommendedOption?.length ? "NOT AVAILABLE" : "OTHER OPTIONS"}
            </Typography>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
                rowGap: 1.5,
              }}
            >
              {disabledOptions?.map((item, index) => (
                <DisplayOptionCard
                  key={item?.title}
                  title={item?.title}
                  description={item?.description}
                  // disabled={true}
                  card={item?.card}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: "20px",
          flexGrow: 0,
          height: "76px",
          minHeight: "76px",
          maxHeight: "76px",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            closeForm();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          data-cy="select-block-type-next-button"
          onClick={() => {
            // setIntegrationConfig({
            //   endpoint,
            //   type,
            // });
            setActiveStep(3);
          }}
          disabled={!type}
        >
          Next
        </Button>
      </DialogActions>
    </FormWrapper>
  );
};

export const DisplayOptionCard: FC<DisplayOptionCardProps> = ({
  title,
  description,
  card,
  disabled = false,
}) => {
  const { type, setType } = useIntegrationField();
  return (
    <Paper
      elevation={0}
      variant="outlined"
      role="button"
      className={type === card?.type ? "active" : ""}
      sx={{
        width: "100%",
        bgcolor: "grey.100",
        borderRadius: 2,
        borderColor: "border",
        overflow: "hidden",
        "&:hover": (theme) => ({
          // bgcolor: alpha(theme.palette.action.hover, 0.04),
          "& .left-content": {
            bgcolor: alpha(theme.palette.action.hover, 0.04),
          },
        }),
        "&.active": (theme) => ({
          outline: "1px solid",
          outlineColor: "primary.main",
          "& .left-content": {
            bgcolor: `${alpha(theme.palette.primary.main, 0.04)}!important`,
          },
          // "& .right-content": {
          //   // bgcolor: `${theme.palette.grey[100]}!important`,
          //   bgcolor: `${alpha(theme.palette.primary.main, 0.01)}!important`,
          // },
        }),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
      }}
      onClick={() => {
        setType(card?.type);
      }}
    >
      <Grid container spacing={0} height="100%" width="100%">
        <Grid size={3}>
          <Box
            className="left-content"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            bgcolor="background.paper"
            width="100%"
            height="100%"
            p={2}
          >
            {["shopify", "youtube", "mux", "classy"]?.includes(card?.type) && (
              <Box
                sx={{
                  width: "32px",
                  height: "fit-content",
                  boxSizing: "border-box",
                  position: "relative",
                  mb: 1,
                }}
              >
                <Avatar
                  src={`/images/${card?.type}Icon.svg`}
                  variant="square"
                  sizes="small"
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" fontWeight={400} color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Grid>
        <Grid size={9}>
          <Box
            className="right-content"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            width="100%"
            height="100%"
            px={10}
            py={3}
          >
            <IntegrationDisplay {...card} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SelectDisplayOptions;
