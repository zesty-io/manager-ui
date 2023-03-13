import { useMemo, FC } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Skeleton,
} from "@mui/material";
import moment from "moment";
import { uniqBy } from "lodash";
import { useParams } from "../../../../../../../shell/hooks/useParams";
import { accountsApi } from "../../../../../../../shell/services/accounts";
import { Audit } from "../../../../../../../shell/services/types";
import {
  DateRangeFilter,
  DateRangeFilterValue,
  UserFilter,
} from "../../../../../../../shell/components/Filters";

type Filter =
  | "happenedAt"
  | "sortByUsers"
  | "resourceType"
  | "actionByUserZUID"
  | "action"
  | "userRole";
interface FiltersProps {
  showSkeletons: boolean;
  filters: Filter[];
  actions: Audit[];
}
export const Filters: FC<FiltersProps> = ({
  actions,
  filters,
  showSkeletons,
}) => {
  const [params, setParams] = useParams();

  const { data: usersRoles } = accountsApi.useGetUsersRolesQuery();

  const uniqueUserActions = useMemo(() => {
    const uniqueUsers = uniqBy(actions, "actionByUserZUID");

    return uniqueUsers?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [actions]);

  const uniqueUsersRoles = useMemo(
    () => uniqBy(usersRoles, "role.ZUID"),
    [usersRoles]
  );

  const getFilter = (filter: Filter) => {
    /* 
      TODO: 
        - Make a generic filter component that will accept an array of options for the common filters
        - For other more specific filters, convert them into reusable filters
    */
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
      case "sortByUsers":
        return (
          <>
            <FormLabel>Sort By</FormLabel>
            <Select
              value={params.get("sortByUsers") || ""}
              onChange={(evt) => setParams(evt.target.value, "sortByUsers")}
              size="small"
              displayEmpty
            >
              <MenuItem value="">Most Active</MenuItem>
              <MenuItem value="happenedAt">Most Recently Active</MenuItem>
              <MenuItem value="leastActive">Least Active</MenuItem>
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
              <MenuItem value="code">Code</MenuItem>
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="schema">Schema</MenuItem>
              <MenuItem value="settings">Settings</MenuItem>
            </Select>
          </>
        );
      case "actionByUserZUID":
        return (
          <>
            <UserFilter
              value={params.get("actionByUserZUID") || ""}
              onChange={(userZUID) => setParams(userZUID, "actionByUserZUID")}
              options={uniqueUserActions}
              defaultButtonText="People"
            />
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
              <MenuItem value="2">Modified</MenuItem>
              <MenuItem value="3">Deleted</MenuItem>
              <MenuItem value="4">Published</MenuItem>
              <MenuItem value="5">Unpublished</MenuItem>
              <MenuItem value="6">Scheduled</MenuItem>
            </Select>
          </>
        );
      case "userRole":
        return (
          <>
            <FormLabel>User Role</FormLabel>
            <Select
              value={params.get("userRole") || ""}
              onChange={(evt) => setParams(evt.target.value, "userRole")}
              size="small"
              displayEmpty
            >
              <MenuItem value="">All</MenuItem>
              {uniqueUsersRoles.map((userRole) => (
                <MenuItem key={userRole.role.ZUID} value={userRole.role.name}>
                  {userRole.role.name}
                </MenuItem>
              ))}
            </Select>
          </>
        );
      default:
        break;
    }
  };

  return (
    // TODO: Fix spacing layout
    <Box
      data-cy="filters"
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "space-between",
        mt: 2,
        mb: 1.5,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {filters.map((filter, idx) =>
          showSkeletons ? (
            <Skeleton key={idx} variant="rectangular" width={172} height={56} />
          ) : (
            <FormControl key={idx} sx={{ width: 172 }}>
              {getFilter(filter)}
            </FormControl>
          )
        )}
      </Box>
      {showSkeletons ? (
        <Skeleton variant="rectangular" width={250} height={56} />
      ) : (
        <DateRangeFilter
          value={{
            from: params.get("from")
              ? moment(params.get("from")).format("YYYY-MM-DD")
              : null,
            to: params.get("to")
              ? moment(params.get("to")).format("YYYY-MM-DD")
              : null,
          }}
          onChange={(filter: DateRangeFilterValue) => {
            setParams(moment(filter.from).isValid() ? filter.from : "", "from");
            setParams(moment(filter.to).isValid() ? filter.to : "", "to");
          }}
        />
      )}
    </Box>
  );
};
