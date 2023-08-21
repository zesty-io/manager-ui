import React from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { AuthView } from "./components/AuthView";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../shell/services/cloudFunctions";
import SinglePageAnalytics from "./views/SinglePageAnalytics";
import AnalyticsDashboard from "./views/AnalyticsDashboard";
import { ContentItem } from "../../../../../../shell/services/types";
import { useGetInstanceSettingsQuery } from "../../../../../../shell/services/instance";
import { PropertiesDialog } from "./components/PropertiesDialog";
import { useHistory } from "react-router";

type Props = {
  item?: ContentItem;
};

const Analytics = ({ item }: Props) => {
  const history = useHistory();
  const { isFetching, isError, refetch } = useGetAnalyticsPropertiesQuery();
  const { data: instanceSettings, isFetching: instanceSettingsFetching } =
    useGetInstanceSettingsQuery();
  const propertyId = instanceSettings?.find(
    (setting) => setting.key === "google_property_id"
  )?.value;

  const validateAuth = () => {
    refetch();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          boxSizing: "border-box",
          color: (theme) => theme.palette.text.primary,
        }}
        height={"100%"}
        overflow="auto"
        bgcolor="grey.50"
      >
        {!isError ? (
          <>
            {item ? (
              <Box px={3} py={2}>
                <SinglePageAnalytics item={item} loading={isFetching} />
              </Box>
            ) : (
              <AnalyticsDashboard loading={isFetching} />
            )}
            {!instanceSettingsFetching && !propertyId && !isFetching && (
              <PropertiesDialog
                onClose={(shouldNavAway = false) => {
                  if (shouldNavAway && item) {
                    history.push(
                      `/content/${item?.meta?.contentModelZUID}/${item?.meta?.ZUID}`
                    );
                  }
                  if (shouldNavAway && !item) {
                    history.push(`/launchpad`);
                  }
                }}
              />
            )}
          </>
        ) : (
          <Box px={3} height="100%">
            <AuthView validateAuth={validateAuth} isDashboard={!item} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Analytics;
