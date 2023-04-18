import { Stack } from "@mui/material";

import { useParams } from "../../../hooks/useParams";
import { SortByFilter, FilterValues } from "./SortByFilter";
import { UserFilter } from "../../../components/Filters/";

export const Filters = () => {
  const [params, setParams] = useParams();

  return (
    <Stack direction="row" gap={1.5}>
      <SortByFilter
        value={(params.get("sort") as FilterValues) || "modified"}
        onChange={(value) => {
          setParams(value, "sort");
        }}
      />
    </Stack>
  );
};
