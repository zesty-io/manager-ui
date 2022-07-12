import { useState, useMemo } from "react";
import { Box, Select, MenuItem, FormControl, FormLabel } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "../../../../../../../shell/services/instance";
import { ContentResourceListItem } from "./ContentResourceListItem";
import { ModelResourceListItem } from "./ModelResourceListItem";
import { FileResourceListItem } from "./FileResourceListItem";
import { SettingsResourceListItem } from "./SettingsResourceListItem";
import { uniqBy } from "lodash";

export const ResourceListFilters = () => {
  const { data, isLoading } = instanceApi.useGetAuditsQuery();
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const handleSortChange = (val, name) => {
    if (val) {
      params.set(name, val);
    } else {
      params.delete(name);
    }

    history.push({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  const uniqueUserResources = useMemo(
    () => uniqBy(data, "actionByUserZUID"),
    [data]
  );

  return (
    <Box sx={{ display: "flex", width: 540, gap: 1.5, mt: 3, mb: 1.5 }}>
      <FormControl fullWidth>
        <FormLabel>Sort By</FormLabel>
        <Select value="" onChange={handleSortChange} size="small" displayEmpty>
          <MenuItem value="">Most Recent</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Resource Type</FormLabel>
        <Select
          value={params.get("resourceType") || ""}
          onChange={(evt) => handleSortChange(evt.target.value, "resourceType")}
          size="small"
          displayEmpty
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="content">Content</MenuItem>
          <MenuItem value="schema">Schema</MenuItem>
          <MenuItem value="code">Code</MenuItem>
          <MenuItem value="settings">Settings</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Users</FormLabel>
        <Select
          value={params.get("actionByUserZUID") || ""}
          onChange={(evt) =>
            handleSortChange(evt.target.value, "actionByUserZUID")
          }
          size="small"
          displayEmpty
        >
          <MenuItem value="">All</MenuItem>
          {uniqueUserResources.map((resource, idx) => (
            <MenuItem
              key={resource.id}
              value={resource.actionByUserZUID}
            >{`${resource.firstName} ${resource.lastName}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
