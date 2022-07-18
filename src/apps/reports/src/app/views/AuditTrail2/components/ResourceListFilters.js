import { useMemo } from "react";
import { Box, Select, MenuItem, FormControl, FormLabel } from "@mui/material";
import moment from "moment";
import { uniqBy } from "lodash";
import DateRangePicker from "./DateRangePicker";
import { useParams } from "utility/useParams";

export const ResourceListFilters = (props) => {
  const [params, setParams] = useParams();

  const uniqueUserResources = useMemo(
    () => uniqBy(props.resources, "actionByUserZUID"),
    [props.resources]
  );

  return (
    <Box
      sx={{ display: "flex", mt: 3, mb: 1.5, justifyContent: "space-between" }}
    >
      <Box sx={{ display: "flex", width: 540, gap: 1.5 }}>
        <FormControl fullWidth>
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
        </FormControl>
        <FormControl fullWidth>
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
        </FormControl>
        <FormControl fullWidth>
          <FormLabel>Users</FormLabel>
          <Select
            value={params.get("actionByUserZUID") || ""}
            onChange={(evt) => setParams(evt.target.value, "actionByUserZUID")}
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
