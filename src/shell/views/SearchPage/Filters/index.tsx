import { useMemo } from "react";
import { Stack } from "@mui/material";

import { useParams } from "../../../hooks/useParams";
import { SortByFilter, FilterValues } from "./SortByFilter";
import { UserFilter, DateFilter } from "../../../components/Filters/";
import { useGetUsersQuery } from "../../../services/accounts";

export const Filters = () => {
  const [params, setParams] = useParams();
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
      <UserFilter
        value={params.get("user") || ""}
        onChange={(value) => setParams(value, "user")}
        defaultButtonText="People"
        options={userOptions}
      />
      <DateFilter
        withDateRange
        defaultButtonText="Date"
        onChange={() => {}}
        value={{
          type: "",
          value: "",
        }}
      />
    </Stack>
  );
};
