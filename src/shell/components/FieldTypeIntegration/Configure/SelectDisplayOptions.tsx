import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";

import { IntegrationTypes } from "../../../services/types";
import { GENERIC_DISPLAY_TYPES, SPECIAL_DISPLAY_TYPES } from "../constants";
import { FormWrapper } from "../Shared/FormWrapper";
import DisplayOption from "./DisplayOption";

type SelectDisplayOptionsProps = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  endpoint: string | null;
  type: IntegrationTypes | null;
  setType: (type: IntegrationTypes | null) => void;
  closeForm: () => void;
  resetKeyPaths: () => void;
};

const SelectDisplayOptions = ({
  activeStep,
  setActiveStep,
  endpoint,
  type,
  setType,
  closeForm,
  resetKeyPaths,
}: SelectDisplayOptionsProps) => {
  const { t } = useTranslation();
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
    if (displayType !== type) {
      resetKeyPaths();
    }
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
              {t("shell.integrationSelectDisplayType")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("shell.integrationCanReconfigureLater")}
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
                {t("shell.integrationRecommended")}
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
                  <DisplayOption
                    data-cy={`integrationRecommendedOption-${item?.type}`}
                    key={item?.titleKey}
                    titleKey={item?.titleKey}
                    descriptionKey={item?.descriptionKey}
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
              {!!recommendedOption?.length
                ? t("shell.integrationOtherOptions")
                : t("shell.integrationOptions")}
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
                <DisplayOption
                  data-cy={`integrationOption-${item?.type}`}
                  key={item?.titleKey}
                  titleKey={item?.titleKey}
                  descriptionKey={item?.descriptionKey}
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
              {!!recommendedOption?.length
                ? t("shell.integrationNotAvailable")
                : t("shell.integrationOtherOptions")}
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
                <DisplayOption
                  data-cy={`integrationOtherOption-${item?.type}`}
                  key={item?.titleKey}
                  titleKey={item?.titleKey}
                  descriptionKey={item?.descriptionKey}
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
          p: 2,
        }}
      >
        <Button variant="outlined" color="inherit" onClick={closeForm}>
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="integrationConfigureOptionNextButton"
          variant="contained"
          onClick={handleNext}
          disabled={!displayType}
        >
          {t("common.next")}
        </Button>
      </DialogActions>
    </FormWrapper>
  );
};

export default SelectDisplayOptions;
