import { useMemo, FC } from "react";
import { Box, FormControl, Skeleton } from "@mui/material";
import moment from "moment";
import { uniqBy } from "lodash";
import { useParams } from "../../../../../../../shell/hooks/useParams";
import { accountsApi } from "../../../../../../../shell/services/accounts";
import { Audit } from "../../../../../../../shell/services/types";
import {
  DateRangeFilter,
  DateRangeFilterValue,
  UserFilter,
  GenericFilter,
} from "../../../../../../../shell/components/Filters";

const RESOURCE_TYPES = [
  {
    text: "Code",
    value: "code",
  },
  {
    text: "Content",
    value: "content",
  },
  {
    text: "Schema",
    value: "schema",
  },
  {
    text: "Settings",
    value: "settings",
  },
];
const HAPPENED_AT = [
  {
    text: "Most Recent",
    value: "",
  },
  {
    text: "Oldest First",
    value: "happenedAt",
  },
];
const USER_ACTIVITY = [
  {
    text: "Most Active",
    value: "",
  },
  {
    text: "Most Recently Active",
    value: "happenedAt",
  },
  {
    text: "Least Active",
    value: "leastActive",
  },
];
const ACTION = [
  {
    text: "Created",
    value: "1",
  },
  {
    text: "Modified",
    value: "2",
  },
  {
    text: "Deleted",
    value: "3",
  },
  {
    text: "Published",
    value: "4",
  },
  {
    text: "Unpublished",
    value: "5",
  },
  {
    text: "Scheduled",
    value: "6",
  },
];

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

  const uniqueUsersRoles = useMemo(() => {
    if (usersRoles?.length) {
      const uniqueRoles = uniqBy(usersRoles, "role.ZUID");

      return uniqueRoles?.map((role) => ({
        text: role.role.name,
        value: role.role.name,
      }));
    }
  }, [usersRoles]);

  const getFilter = (filter: Filter) => {
    switch (filter) {
      case "happenedAt":
        return (
          <GenericFilter
            options={HAPPENED_AT}
            value={params.get("sortBy") || ""}
            onChange={(happenedAt) =>
              setParams(happenedAt?.toString(), "sortBy")
            }
            defaultButtonText="Most Recent"
          />
        );
      case "sortByUsers":
        return (
          <GenericFilter
            defaultButtonText="Most Active"
            value={params.get("sortByUsers") || ""}
            onChange={(userActivity) =>
              setParams(userActivity.toString(), "sortByUsers")
            }
            options={USER_ACTIVITY}
          />
        );
      case "resourceType":
        return (
          <GenericFilter
            defaultButtonText="Resource Type"
            value={params.get("resourceType") || ""}
            options={RESOURCE_TYPES}
            onChange={(resourceType) =>
              setParams(resourceType?.toString(), "resourceType")
            }
          />
        );
      case "actionByUserZUID":
        return (
          <UserFilter
            value={params.get("actionByUserZUID") || ""}
            onChange={(userZUID) => setParams(userZUID, "actionByUserZUID")}
            options={uniqueUserActions}
            defaultButtonText="People"
          />
        );
      case "action":
        return (
          <GenericFilter
            defaultButtonText="Action Type"
            value={params.get("action") || ""}
            options={ACTION}
            onChange={(action) => setParams(action.toString(), "action")}
          />
        );
      case "userRole":
        return (
          <GenericFilter
            defaultButtonText="User Role"
            value={params.get("userRole") || ""}
            onChange={(role) => setParams(role.toString(), "userRole")}
            options={uniqueUsersRoles}
          />
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
          inactiveButtonText="Date"
          headerTitle="Date"
        />
      )}
    </Box>
  );
};
