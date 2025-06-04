import { useMemo } from "react";

import {
  useGetAuditsQuery,
  useGetContentModelsQuery,
} from "../services/instance";

type GetAuditsWithBlocksParams = {
  skip?: boolean;
  params?: Record<string, any>;
};
export const useGetAuditsWithBlocks = ({
  skip = false,
  params = {},
}: GetAuditsWithBlocksParams) => {
  const { data: models } = useGetContentModelsQuery();
  const {
    data: actions,
    isLoading,
    isFetching,
    isUninitialized,
    status,
    refetch,
  } = useGetAuditsQuery(params, { skip });

  const auditsWithBlocks = useMemo(() => {
    // if (!models?.length || !actions?.length) {
    //   return [];
    // }

    return actions?.map((audit) => {
      if (audit.affectedZUID.startsWith("7")) {
        // Get the modelZUID from the URI
        const modelZUID = audit.meta.uri?.split("/")?.[4];
        const model = models?.find((model) => model.ZUID === modelZUID);

        if (model?.type === "block") {
          return {
            ...audit,
            resourceType: "block",
          };
        }
      }

      return audit;
    });
  }, [actions, models]);

  return {
    data: auditsWithBlocks,
    isLoading,
    isFetching,
    isUninitialized,
    status,
    refetch,
  };
};
