import { useState } from "react";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "../../../../../../../shell/services/instance";
import { ContentResourceListItem } from "../components/ContentResourceListItem";
import { ModelResourceListItem } from "../components/ModelResourceListItem";
import { FileResourceListItem } from "../components/FileResourceListItem";
import { SettingsResourceListItem } from "../components/SettingsResourceListItem";
import { uniqBy } from "lodash";
import { ResourceList } from "../components/ResourceList";

const tabPaths = ["resources", "users", "timeline", "insights"];

export const ActivityLog = () => {
  const history = useHistory();
  const location = useLocation();
  const { data, isLoading } = instanceApi.useGetAuditsQuery();

  // const uniqueResources = [...new Set(data?.map(item => item.affectedZUID))]?.map(ZUID => data?.find(resource => resource.affectedZUID === ZUID))

  let uniqueResources = uniqBy(
    data?.map((resource) => {
      // Format data set to treat any model field change as a model change
      const clonedResource = { ...resource };
      if (resource.affectedZUID.startsWith("12")) {
        clonedResource.affectedZUID = resource.meta.uri.split("/")[4];
      }
      return clonedResource;
    }),
    "affectedZUID"
  );

  const handleTabChange = (evt, newValue) => {
    history.push(`/reports/activity-log/${tabPaths[newValue]}`);
  };

  const activeTab = tabPaths.indexOf(location.pathname.split("/").pop());

  const getView = () => {
    switch (activeTab) {
      case 0:
        return <ResourceList />;
      case 1:
        return <div>USERS</div>;
      case 2:
        return <div>TIMELINE</div>;
      case 3:
        return <div>INSIGHTS</div>;
      default:
        break;
    }
  };

  if (isLoading) return <div>loading...</div>;

  return (
    <>
      <Box sx={{ px: 3, pt: 3 }}>
        <Typography variant="h4">Activity Log</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Your instance timeline by resources and users
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="RESOURCES" />
          <Tab label="USERS" />
          <Tab label="TIMELINE" />
          <Tab label="INSIGHTS" />
        </Tabs>
      </Box>
      {getView()}
    </>
  );
};
