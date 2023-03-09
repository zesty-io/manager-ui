import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import moment from "moment";
import { isEmpty } from "lodash";

import { ActionsTimeline } from "../../../../reports/src/app/views/ActivityLog/components/ActionsTimeline";
import { Filters } from "../../../../reports/src/app/views/ActivityLog/components/Filters";
import { ActionsByUsers } from "../../../../reports/src/app/views/ActivityLog/components/ActionsByUsers";
import {
  useGetContentModelQuery,
  useGetAuditsQuery,
} from "../../../../../shell/services/instance";
import { useParams as useSearchParams } from "../../../../../shell/hooks/useParams";
import { filterByParams } from "../../../../../utility/filterByParams";

type Params = {
  id: string;
};
export const ModelActivityLog = () => {
  const { id } = useParams<Params>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  const {
    data: modelData,
    isLoading: isLoadingModelData,
    isFetching: isFetchingModelData,
  } = useGetContentModelQuery(id, { skip: !id });
  const {
    data: audits,
    isLoading: isLoadingAudits,
    isFetching: isFetchingAudits,
  } = useGetAuditsQuery(
    {
      start_date: moment(searchParams.get("from")).format("L"),
      end_date: moment(searchParams.get("to")).format("L"),
    },
    { skip: !initialized }
  );

  useEffect(() => {
    if (
      !searchParams.get("from") &&
      !searchParams.get("to") &&
      !isEmpty(modelData)
    ) {
      setSearchParams(
        moment(modelData?.createdAt).format("YYYY-MM-DD"),
        "from"
      );
      setSearchParams(moment().format("YYYY-MM-DD"), "to");
    }

    setInitialized(true);
  }, [modelData, location.pathname]);

  const relatedAudits = useMemo(
    () => audits?.filter((audit) => audit.affectedZUID === id) || [],
    [id, audits]
  );

  const filteredAudits = useMemo(
    () =>
      relatedAudits?.length ? filterByParams(relatedAudits, searchParams) : [],
    [relatedAudits, searchParams]
  );

  return (
    <Stack
      px={3}
      sx={{
        "*::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Filters
        filters={["action", "actionByUserZUID"]}
        actions={relatedAudits}
        showSkeletons={isLoadingAudits || isLoadingModelData}
      />

      <Stack direction="row" justifyContent="space-between" gap={6}>
        <ActionsTimeline
          actions={filteredAudits}
          showSkeletons={isLoadingAudits || isLoadingModelData}
        />

        <Box sx={{ minWidth: 260 }}>
          <ActionsByUsers
            actions={filteredAudits}
            showSkeletons={isFetchingAudits || isFetchingModelData}
          />
        </Box>
      </Stack>
    </Stack>
  );
};
