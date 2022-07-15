import { useMemo } from "react";
import { Box, Select, MenuItem, FormControl, FormLabel } from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import moment from "moment";
import { uniqBy } from "lodash";
import DateRangePicker from "./DateRangePicker";

export const ResourceDetailsFilters = (props) => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const uniqueUserResources = useMemo(
    () => uniqBy(props.actions, "actionByUserZUID"),
    [props.actions]
  );

  const handleParamsChange = (val, name) => {
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

  return (
    <Box
      sx={{ display: "flex", mt: 3, mb: 1.5, justifyContent: "space-between" }}
    >
      <Box sx={{ display: "flex", width: 452, gap: 1.5 }}>
        <FormControl fullWidth>
          <FormLabel>Action Type</FormLabel>
          <Select
            value={params.get("action") || ""}
            onChange={(evt) => handleParamsChange(evt.target.value, "action")}
            size="small"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">Created</MenuItem>
            <MenuItem value="2">Saved</MenuItem>
            <MenuItem value="3">Deleted</MenuItem>
            <MenuItem value="4">Published</MenuItem>
            <MenuItem value="5">Unpublished</MenuItem>
            <MenuItem value="6">Scheduled</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel>Users</FormLabel>
          <Select
            value={params.get("actionByUserZUID") || ""}
            onChange={(evt) =>
              handleParamsChange(evt.target.value, "actionByUserZUID")
            }
            size="small"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            {uniqueUserResources.map((resource) => (
              <MenuItem
                key={resource.actionByUserZUID}
                value={resource.actionByUserZUID}
              >{`${resource.firstName} ${resource.lastName}`}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <DateRangePicker
        inputFormat="MMM dd, yyyy"
        value={[
          params.get("from") ? moment(params.get("from")) : null,
          params.get("to") ? moment(params.get("to")) : null,
        ]}
        onChange={([from, to]) => {
          handleParamsChange(
            moment(from, "YYYY-MM-DD").isValid()
              ? moment(from).format("YYYY-MM-DD")
              : "",
            "from"
          );
          handleParamsChange(
            moment(to, "YYYY-MM-DD").isValid()
              ? moment(to).format("YYYY-MM-DD")
              : "",
            "to"
          );
        }}
      />
    </Box>
  );
};
