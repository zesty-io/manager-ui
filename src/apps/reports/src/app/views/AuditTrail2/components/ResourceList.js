import { useState, useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { uniqBy } from "lodash";
import moment from "moment";
import { Pie } from "react-chartjs-2";
import { instanceApi } from "../../../../../../../shell/services/instance";
import { ContentResourceListItem } from "./ContentResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";
import { ResourceListFilters } from "./ResourceListFilters";

export const ResourceList = () => {
  const theme = useTheme();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const { data, isLoading } = instanceApi.useGetAuditsQuery({
    ...(params.get("from") && {
      start_date: moment(params.get("from")).format("L"),
    }),
    ...(params.get("to") && { end_date: moment(params.get("to")).format("L") }),
  });

  let filteredResources = data ? [...data] : [];

  for (const [key, value] of params.entries()) {
    if (key === "from" || key === "to") {
    } else if (key === "sortBy") {
      filteredResources = filteredResources.sort(
        (a, b) => new Date(a[value]) - new Date(b[value])
      );
    } else {
      filteredResources = filteredResources.filter(
        (resource) => resource?.[key] === value
      );
    }
  }

  const uniqueResources = uniqBy(
    filteredResources?.map((resource) => {
      // Format data set to treat any model field change as a model change
      const clonedResource = { ...resource };
      if (resource.affectedZUID.startsWith("12")) {
        clonedResource.affectedZUID = resource.meta.uri.split("/")[4];
      }
      return clonedResource;
    }),
    "affectedZUID"
  );

  const uniqueUserResources = useMemo(
    () => uniqBy(data, "actionByUserZUID"),
    [data]
  );

  return (
    <Box
      sx={{
        px: 3,
      }}
    >
      <ResourceListFilters users={uniqueUserResources} />
      <Box sx={{ display: "flex", gap: "92px" }}>
        <Box
          sx={{ overflowY: "scroll", flex: 1, height: "calc(100vh - 282px)" }}
        >
          {uniqueResources?.map((resource) => {
            if (resource.affectedZUID.startsWith("7")) {
              return (
                <ContentResourceListItem
                  key={resource.ZUID}
                  affectedZUID={resource.affectedZUID}
                  updatedAt={resource.updatedAt}
                />
              );
            } else if (resource.affectedZUID.startsWith("6")) {
              return (
                <ModelResourceListItem
                  key={resource.ZUID}
                  affectedZUID={resource.affectedZUID}
                  updatedAt={resource.updatedAt}
                />
              );
            } else if (
              resource.affectedZUID.startsWith("10") ||
              resource.affectedZUID.startsWith("11")
            ) {
              return (
                <FileResourceListItem
                  key={resource.ZUID}
                  affectedZUID={resource.affectedZUID}
                  updatedAt={resource.updatedAt}
                />
              );
            } else {
              return (
                <SettingsResourceListItem
                  key={resource.ZUID}
                  affectedZUID={resource.affectedZUID}
                  updatedAt={resource.updatedAt}
                  message={resource.meta.message}
                />
              );
            }
          })}
        </Box>
        <Box sx={{ p: 4, width: 298, boxSizing: "border-box" }}>
          <Typography variant="overline">ACTIVITY BY RESOURCE</Typography>
          <Typography variant="h4">{filteredResources.length}</Typography>
          <Typography variant="subtitle2">Actions</Typography>
          <Box sx={{ width: 160, height: 160, mt: 3, mb: 4 }}>
            <Pie
              width={"100%"}
              height={"100%"}
              options={{
                legend: {
                  display: false,
                },
              }}
              data={{
                labels: ["Content", "Schema", "Code", "Settings"],
                datasets: [
                  {
                    data: [
                      Math.ceil(
                        (filteredResources.filter(
                          (resource) => resource.resourceType === "content"
                        ).length /
                          filteredResources.length) *
                          100
                      ),
                      Math.ceil(
                        (filteredResources.filter(
                          (resource) => resource.resourceType === "schema"
                        ).length /
                          filteredResources.length) *
                          100
                      ),
                      Math.ceil(
                        (filteredResources.filter(
                          (resource) => resource.resourceType === "code"
                        ).length /
                          filteredResources.length) *
                          100
                      ),
                      Math.ceil(
                        (filteredResources.filter(
                          (resource) => resource.resourceType === "settings"
                        ).length /
                          filteredResources.length) *
                          100
                      ),
                    ],
                    backgroundColor: [
                      theme.palette.deepPurple[400],
                      theme.palette.blue[400],
                      theme.palette.pink[400],
                      theme.palette.green[400],
                    ],
                  },
                ],
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                mr: 1,
                width: 12,
                height: 12,
                backgroundColor: "deepPurple.400",
                borderRadius: 100,
              }}
            ></Box>
            <Typography variant="caption">Content</Typography>
            <Typography variant="caption" sx={{ ml: "auto" }}>
              {Math.ceil(
                (filteredResources.filter(
                  (resource) => resource.resourceType === "content"
                ).length /
                  filteredResources.length) *
                  100
              )}
              %
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                mr: 1,
                width: 12,
                height: 12,
                backgroundColor: "blue.400",
                borderRadius: 100,
              }}
            ></Box>
            <Typography variant="caption">Schema</Typography>
            <Typography variant="caption" sx={{ ml: "auto" }}>
              {Math.ceil(
                (filteredResources.filter(
                  (resource) => resource.resourceType === "schema"
                ).length /
                  filteredResources.length) *
                  100
              )}
              %
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                mr: 1,
                width: 12,
                height: 12,
                backgroundColor: "pink.400",
                borderRadius: 100,
              }}
            ></Box>
            <Typography variant="caption">Code</Typography>
            <Typography variant="caption" sx={{ ml: "auto" }}>
              {Math.ceil(
                (filteredResources.filter(
                  (resource) => resource.resourceType === "code"
                ).length /
                  filteredResources.length) *
                  100
              )}
              %
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                mr: 1,
                width: 12,
                height: 12,
                backgroundColor: "green.400",
                borderRadius: 100,
              }}
            ></Box>
            <Typography variant="caption">Settings</Typography>
            <Typography variant="caption" sx={{ ml: "auto" }}>
              {Math.ceil(
                (filteredResources.filter(
                  (resource) => resource.resourceType === "settings"
                ).length /
                  filteredResources.length) *
                  100
              )}
              %
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
