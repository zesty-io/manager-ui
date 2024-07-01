import { useMemo } from "react";
import { Stack } from "@mui/material";

import { useParams } from "../../../hooks/useParams";
import { SortByFilter, FilterValues } from "./SortByFilter";
import { UserFilter, DateFilter } from "../../../components/Filters/";
import { useGetUsersQuery } from "../../../services/accounts";
import { ResourceTypeFilter } from "./ResourceTypeFilter";
import { ResourceType } from "../../../services/types";
import { LanguageFilter } from "./LanguageFilter";
import { useDateFilterParams } from "../../../hooks/useDateFilterParams";

export const Filters = () => {
  const [params, setParams] = useParams();
  const [activeDateFilter, setActiveDateFilter] = useDateFilterParams();
  const { data: users } = useGetUsersQuery();
  const userOptions = useMemo(() => {
    return users?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [users]);

  return (
    <Stack direction="row" gap={1.5}>
      <SortByFilter
        value={(params.get("sort") as FilterValues) || "modified"}
        onChange={(value) => setParams(value, "sort")}
      />
      <ResourceTypeFilter
        onChange={(value) => setParams(value, "resource")}
        value={(params.get("resource") as ResourceType) || ""}
      />
      <UserFilter
        value={params.get("user") || ""}
        onChange={(value) => setParams(value, "user")}
        defaultButtonText="Created By"
        options={userOptions}
      />
      <DateFilter
        withDateRange
        defaultButtonText="Date Modified"
        onChange={(value) => setActiveDateFilter(value)}
        value={activeDateFilter}
      />
      <LanguageFilter
        value={params.get("lang") || ""}
        onChange={(value) => setParams(value, "lang")}
      />
    </Stack>
  );
};
