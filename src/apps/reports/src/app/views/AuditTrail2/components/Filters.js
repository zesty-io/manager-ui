import { useMemo } from "react";
import { Box, Select, MenuItem, FormControl, FormLabel } from "@mui/material";
import moment from "moment";
import { uniqBy } from "lodash";
import DateRangePicker from "./DateRangePicker";
import { useParams } from "shell/hooks/useParams";

export const Filters = (props) => {
  const [params, setParams] = useParams();

  const uniqueUserActions = useMemo(
    () => uniqBy(props.actions, "actionByUserZUID"),
    [props.actions]
  );

  const getFilter = (filter) => {
    switch (filter) {
      case "happenedAt":
        return (
          <>
            <FormLabel>Sort By</FormLabel>
            <Select
              value={params.get("sortBy") || ""}
              onChange={(evt) => setParams(evt.target.value, "sortBy")}
              size="small"
              displayEmpty
            >
              <MenuItem value="">Most Recent</MenuItem>
              <MenuItem value="happenedAt">Oldest First</MenuItem>
            </Select>
          </>
        );
      case "resourceType":
        return (
          <>
            <FormLabel>Resource Type</FormLabel>
            <Select
              value={params.get("resourceType") || ""}
              onChange={(evt) => setParams(evt.target.value, "resourceType")}
              size="small"
              displayEmpty
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="schema">Schema</MenuItem>
              <MenuItem value="code">Code</MenuItem>
              <MenuItem value="settings">Settings</MenuItem>
            </Select>
          </>
        );
      case "actionByUserZUID":
        return (
          <>
            <FormLabel>Users</FormLabel>
            <Select
              value={params.get("actionByUserZUID") || ""}
              onChange={(evt) =>
                setParams(evt.target.value, "actionByUserZUID")
              }
              size="small"
              displayEmpty
            >
              <MenuItem value="">All</MenuItem>
              {uniqueUserActions.map((resource) => (
                <MenuItem
                  key={resource.actionByUserZUID}
                  value={resource.actionByUserZUID}
                >{`${resource.firstName} ${resource.lastName}`}</MenuItem>
              ))}
            </Select>
          </>
        );
      case "action":
        return (
          <>
            <FormLabel>Action Type</FormLabel>
            <Select
              value={params.get("action") || ""}
              onChange={(evt) => setParams(evt.target.value, "action")}
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
          </>
        );
      default:
        break;
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {props.filters.map((filter) => (
          <FormControl sx={{ width: 172 }}>{getFilter(filter)}</FormControl>
        ))}
      </Box>
      <DateRangePicker
        inputFormat="MMM dd, yyyy"
        value={[
          params.get("from") ? moment(params.get("from")) : null,
          params.get("to") ? moment(params.get("to")) : null,
        ]}
        onChange={([from, to]) => {
          setParams(
            moment(from, "YYYY-MM-DD").isValid()
              ? moment(from).format("YYYY-MM-DD")
              : "",
            "from"
          );
          setParams(
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
