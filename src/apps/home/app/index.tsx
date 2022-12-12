import { Box, ThemeProvider, CircularProgress } from "@mui/material";
import { theme } from "@zesty-io/material";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  useGetContentItemPublishingsQuery,
  useGetContentModelItemsQuery,
  useGetContentModelsQuery,
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
  } = useGetContentItemPublishingsQuery(
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
      moment(model.createdAt).diff(instanceCreatedAtDate, "minutes") >= 10
  );
  const isFetching =
    isModelsFetching ||
    isContentModelItemsFetching ||
    isContentItemPublishingsFetching;

  const showMature =
    (hasEditedHomepage && hasPublishedHomepage && hasCreatedNewModel) ||
    isAMonthOld;

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
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
        }}
      >
        <Header hideSubtitle={!showMature} />
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
                <MetricCards />
              </Box>
            )}
            <Box display="flex" gap={3} sx={{ height: "calc(100vh - 286px)" }}>
              {showMature ? (
                <ResourceTable />
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
