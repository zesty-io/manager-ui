import { Box, ThemeProvider, CircularProgress } from "@mui/material";
import { theme } from "@zesty-io/material";
import { useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  useGetContentModelItemsQuery,
  useGetContentModelsQuery,
  useGetItemPublishingsQuery,
} from "../../../shell/services/instance";
import { AppState } from "../../../shell/store/types";
import { CongratulationsDialog } from "./components/CongratulationsDialog";
import { Guide } from "./components/Guide";
import { Header } from "./components/Header";
import { MetricCards } from "./components/MetricCards";
import { ResourcesCard } from "./components/ResourcesCard";
import { ResourceTable } from "./components/ResourceTable";

const date = new Date();

export const HomeApp = () => {
  const instanceCreatedAtDate = useSelector(
    (state: AppState) => state.instance.createdAt
  );
  const isAMonthOld = moment(date).diff(instanceCreatedAtDate, "months") >= 1;
  const { data: models, isFetching: isModelsFetching } =
    useGetContentModelsQuery(undefined, { skip: isAMonthOld });
  const homepageModel = models?.find((model) => model.name === "homepage");
  const { data: contentModelItems, isFetching: isContentModelItemsFetching } =
    useGetContentModelItemsQuery(homepageModel?.ZUID, {
      skip: !homepageModel || isAMonthOld,
    });
  const {
    data: contentItemPublishings,
    isFetching: isContentItemPublishingsFetching,
  } = useGetItemPublishingsQuery(
    {
      modelZUID: homepageModel?.ZUID,
      itemZUID: contentModelItems?.[0]?.meta?.ZUID,
    },
    { skip: !contentModelItems?.[0] || isAMonthOld }
  );
  const hasEditedHomepage = contentModelItems?.[0]?.web?.version > 1;
  const hasPublishedHomepage = !!contentItemPublishings?.length;
  const hasCreatedNewModel = models?.some(
    (model) =>
      moment(model.createdAt).diff(instanceCreatedAtDate, "minutes") >= 2
  );
  const isFetching =
    isModelsFetching ||
    isContentModelItemsFetching ||
    isContentItemPublishingsFetching;

  const showMature =
    (hasEditedHomepage && hasPublishedHomepage && hasCreatedNewModel) ||
    isAMonthOld;

  const [dateRange, setDateRange] = useState(30);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          color: "text.primary",
          backgroundColor: "grey.50",
          height: "100%",
          "*": {
            boxSizing: "border-box",
          },
        }}
      >
        <Header
          hideSubtitle={!showMature}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        {isFetching ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="calc(100% - 160px)"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mx: 3, mt: -7.5 }}>
            {showMature && (
              <Box sx={{ mb: 2 }}>
                <MetricCards dateRange={dateRange} />
              </Box>
            )}
            <Box display="flex" gap={3} sx={{ height: "calc(100vh - 286px)" }}>
              {showMature ? (
                <ResourceTable dateRange={dateRange} />
              ) : (
                <Guide
                  hasEditedHomepage={hasEditedHomepage}
                  hasPublishedHomepage={hasPublishedHomepage}
                  hasCreatedNewModel={hasCreatedNewModel}
                  modelZUID={homepageModel?.ZUID}
                  itemZUID={contentModelItems?.[0]?.meta?.ZUID}
                />
              )}
              <Box
                sx={{
                  minWidth: 327,
                  maxWidth: 327,
                  backgroundColor: "common.white",
                  border: (theme) => `1px solid ${theme.palette.border}`,
                  borderRadius: "8px",
                  height: "fit-content",
                }}
              >
                <ResourcesCard isMature={showMature} />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};
