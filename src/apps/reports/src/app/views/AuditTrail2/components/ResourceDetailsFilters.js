import { useMemo } from "react";
import { Box, Select, MenuItem, FormControl, FormLabel } from "@mui/material";
import moment from "moment";
import { uniqBy } from "lodash";
import DateRangePicker from "./DateRangePicker";
import { useParams } from "shell/hooks/useParams";

export const ResourceDetailsFilters = (props) => {
  const [params, setParams] = useParams();

  const uniqueUserResources = useMemo(
    () => uniqBy(props.actions, "actionByUserZUID"),
    [props.actions]
  );

  return (
    <Box
      sx={{ display: "flex", mt: 3, mb: 1.5, justifyContent: "space-between" }}
    >
      <Box sx={{ display: "flex", width: 452, gap: 1.5 }}>
        <FormControl fullWidth>
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
