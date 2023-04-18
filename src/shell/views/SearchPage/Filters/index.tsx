import { Stack } from "@mui/material";

import { useParams } from "../../../hooks/useParams";
import { SortBy, FilterValues } from "./SortBy";

export const Filters = () => {
  const [params, setParams] = useParams();

  return (
    <Stack direction="row" gap={1.5}>
      <SortBy
        activeFilter={(params.get("sort") as FilterValues) || "modified"}
        onChange={(value) => {
          setParams(value, "sort");
        }}
      />
    </Stack>
  );
};
