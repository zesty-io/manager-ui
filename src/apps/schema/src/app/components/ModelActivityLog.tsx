import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import moment from "moment";
import { isEmpty } from "lodash";

import { ActionsTimeline } from "../../../../reports/src/app/views/ActivityLog/components/ActionsTimeline";
import { Filters } from "../../../../reports/src/app/views/ActivityLog/components/Filters";
import { ActionsByUsers } from "../../../../reports/src/app/views/ActivityLog/components/ActionsByUsers";
import { EmptyState } from "../../../../reports/src/app/views/ActivityLog/components/EmptyState";
import {
  useGetContentModelQuery,
  useGetAuditsQuery,
} from "../../../../../shell/services/instance";
import { useParams as useSearchParams } from "../../../../../shell/hooks/useParams";
import { filterByParams } from "../../../../../utility/filterByParams";
import { toUTC } from "../../../../reports/src/app/views/ActivityLog/utils";

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
  } = useGetContentModelQuery(id);
  const {
    data: audits,
    isLoading: isLoadingAudits,
    isFetching: isFetchingAudits,
  } = useGetAuditsQuery(
    {
      ...(searchParams.get("from") && {
        start_date: toUTC(searchParams.get("from")),
      }),
      ...(searchParams.get("to") && {
        end_date: toUTC(searchParams.get("to")),
      }),
    },
    { skip: !initialized }
  );

  useEffect(() => {
    if (
      !searchParams.get("from") &&
      !searchParams.get("to") &&
      !isEmpty(modelData)
    ) {
      useDefaultDateParams();
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

  const useDefaultDateParams = () => {
    setSearchParams(moment(modelData?.createdAt).format("YYYY-MM-DD"), "from");
    setSearchParams(moment().format("YYYY-MM-DD"), "to");
  };

  return (
    <Stack
      height="100%"
      px={4}
      pt={0.5}
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

      {(!isFetchingAudits || !isFetchingAudits) && !filteredAudits?.length ? (
        <Stack
          height="calc(100svh - 230px)"
          justifyContent="center"
          alignItems="center"
        >
          <EmptyState
            title="No Logs Found"
            onReset={() => {
              setSearchParams("", "action");
              setSearchParams("", "actionByUserZUID");
              useDefaultDateParams();
            }}
          />
        </Stack>
      ) : (
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={6}
          height="100%"
        >
          <ActionsTimeline
            actions={filteredAudits}
            showSkeletons={isFetchingAudits || isLoadingModelData}
          />

          <Box sx={{ minWidth: 260 }}>
            <ActionsByUsers
              actions={filteredAudits}
              showSkeletons={isFetchingAudits || isFetchingModelData}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
};
