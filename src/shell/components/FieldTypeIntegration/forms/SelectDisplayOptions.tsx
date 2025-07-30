import { FC, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Paper,
  Avatar,
  alpha,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import { FormWrapper } from "./Wrappers";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IntegrationTypes } from "../../../services/types";
import {
  DisplayOptionCardProps,
  GENERIC_DISPLAY_TYPES,
  SPECIAL_DISPLAY_TYPES,
} from "../configs";
import DisplayCard from "../DisplayCard";

const SelectDisplayOptions = ({
  activeStep,
  setActiveStep,
  endpoint,
  type,
  setType,
  closeForm,
}: {
  activeStep: number;
  setActiveStep: (step: number) => void;
  endpoint: string | null;
  type: IntegrationTypes | null;
  setType: (type: IntegrationTypes | null) => void;
  closeForm: () => void;
}) => {
  const [recommendedType, setRecommendedType] =
    useState<IntegrationTypes | null>(null);

  const [displayType, setDisplayType] = useState<IntegrationTypes | null>(
    type || null
  );

  const recommendedOption = SPECIAL_DISPLAY_TYPES.filter(
    (option) => option.type === recommendedType
  );

  const disabledOptions = SPECIAL_DISPLAY_TYPES.filter(
    (option) => option.type !== recommendedType
  );

  const handleNext = () => {
    setType(displayType);
    setActiveStep(activeStep + 1);
  };

  useEffect(() => {
    const endpointTypes: { keyword: string; type: IntegrationTypes }[] = [
      { keyword: "mux", type: "mux" },
      { keyword: "youtube", type: "youtube" },
      { keyword: "shopify", type: "shopify" },
      { keyword: "classy", type: "classy" },
    ];

    const apiUrl = new URL(endpoint || "");

    const matchedType: IntegrationTypes | null =
      endpointTypes.find(({ keyword }) => apiUrl?.origin?.includes(keyword))
        ?.type || null;
    setRecommendedType(matchedType);
    if (!!displayType) return;
    setDisplayType(matchedType);
  }, [endpoint, displayType]);

  return (
    <FormWrapper height="calc(100vh - 40px)" width="1080px">
      <DialogTitle
        component="div"
        flexGrow={0}
        p={2}
        sx={{ borderBottom: "1px solid", borderColor: "border" }}
      >
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
        data-cy="integrationSelectDisplayOptionsDialog"
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
                data-cy="integrationRecommendedOptionsContainer"
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
                    data-cy={`integrationRecommendedOption-${item?.type}`}
                    key={item?.title}
                    title={item?.title}
                    description={item?.description}
                    card={item?.card}
                    type={item?.type}
                    disableMenu={true}
                    isSelected={displayType === item?.type}
                    onSelect={() => {
                      setDisplayType(item?.type);
                    }}
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
              data-cy="integrationOptionsContainer"
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
                  data-cy={`integrationOption-${item?.type}`}
                  key={item?.title}
                  title={item?.title}
                  description={item?.description}
                  card={item?.card}
                  type={item?.type}
                  disableMenu={true}
                  isSelected={displayType === item?.type}
                  onSelect={() => {
                    setDisplayType(item?.type);
                  }}
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
              data-cy="integrationOtherOptionsContainer"
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
                  data-cy={`integrationOtherOption-${item?.type}`}
                  key={item?.title}
                  title={item?.title}
                  description={item?.description}
                  disabled={true}
                  card={item?.card}
                  type={item?.type}
                  disableMenu={true}
                  isSelected={displayType === item?.type}
                  onSelect={() => {
                    setDisplayType(item?.type);
                  }}
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
          borderTop: "1px solid",
          borderColor: "border",
        }}
      >
        <Button variant="outlined" color="inherit" onClick={closeForm}>
          Cancel
        </Button>
        <Button
          data-cy="integrationConfigureOptionNextButton"
          variant="contained"
          onClick={handleNext}
          disabled={!displayType}
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
  type,
  card,
  disabled = false,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Paper
      data-cy={`integrationDisplayOption-${type}`}
      elevation={0}
      variant="outlined"
      role="button"
      className={isSelected ? "active" : "free-card"}
      sx={{
        position: "relative",
        width: "100%",
        bgcolor: "grey.100",
        borderRadius: "4px",
        borderColor: "border",
        overflow: "hidden",
        "& .hover-overlay": {
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          bgcolor: "grey.400",
          opacity: 0.1,
        },
        "&.free-card:hover": (theme) => ({
          "& .left-content": {
            bgcolor: alpha(theme.palette.action.hover, 0.04),
          },
          "& .right-content": {
            bgcolor: alpha(theme.palette.grey[200], 0.08),
          },
        }),
        "&.active": (theme) => ({
          outline: "1px solid",
          outlineColor: "primary.main",
          "& .left-content": {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderRight: `1px solid ${theme.palette.primary.main}`,
          },
          "& .right-content": {
            bgcolor: alpha(theme.palette.primary.main, 0.01),
          },
        }),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
      }}
      onClick={() => {
        onSelect();
      }}
    >
      <Grid container spacing={0} height="100%" width="100%" bgcolor="grey.100">
        <Grid size={3}>
          <Box
            className="left-content"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            bgcolor="background.paper"
            borderColor="primary.main"
            width="100%"
            height="100%"
            p={2}
          >
            {["shopify", "youtube", "mux", "classy"]?.includes(type) && (
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
                  src={`/images/${type}Icon.svg`}
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
        <Grid size={9} sx={{ zIndex: 2 }}>
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
            bgcolor="grey.100"
          >
            <Paper
              className="PreviewCard"
              elevation={0}
              sx={{
                py: 0,
                pl: 3.5,
                pr: "40px",
                width: "100%",
                height: "fit-content",
                borderRadius: 2,
                position: "relative",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                my: 0.5,
              }}
            >
              <Box
                className="PreviewCardDragHandle"
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "28px",
                  display: "grid",
                  placeContent: "center",
                }}
              >
                <DragIndicatorRoundedIcon color="action" fontSize="small" />
              </Box>
              <DisplayCard
                rootPath=""
                type={type}
                heading={card?.heading}
                subHeading={card?.subHeading}
                detail={card?.detail}
                thumbnail={card?.thumbnail}
                details={card?.details}
              />
              <Box
                position="absolute"
                right={0}
                width="40px"
                height="100%"
                pr={2}
                sx={{
                  display: "grid",
                  placeContent: "center",
                }}
              >
                <MoreHorizIcon color="action" />
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SelectDisplayOptions;
