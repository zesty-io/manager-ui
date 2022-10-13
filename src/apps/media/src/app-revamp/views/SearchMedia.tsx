import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import {
  useGetAllBinGroupsQuery,
  useGetEcoBinsQuery,
  useGetSiteBinsQuery,
  useSearchBinFilesQuery,
} from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";
import { useParams } from "../../../../../shell/hooks/useParams";
import { SearchEmptyState } from "../components/SearchEmptyState";

interface Props {
  lockedToGroupId?: string;
}

export const SearchMedia = ({ lockedToGroupId }: Props) => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term") || "";
  const { data: bins } = useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });
  const [isInvalidFileId, setIsInvalidFileId] = useState<boolean>(false);

  // not found state
  const [notFoundTitle, setNotFoundTitle] = useState<string>("");
  const [notFoundMessage, setNotFoundMessage] = useState<string>("");

  const combinedBins = [...(ecoBins || []), ...(bins || [])];

  const {
    data: binGroups,
    isFetching: isGroupsFetching,
    isUninitialized: isGroupsUninitialized,
  } = useGetAllBinGroupsQuery(
    combinedBins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );

  const {
    data: files,
    isFetching: isFilesFetching,
    isUninitialized: isFilesUninitialized,
  } = useSearchBinFilesQuery(
    { binIds: combinedBins?.map((bin) => bin.id), term },
    {
      skip: !bins?.length,
    }
  );

  const filteredGroups = useMemo(() => {
    if (binGroups) {
      return binGroups
        .flat()
        .filter((group) =>
          !lockedToGroupId
            ? group.name.toLowerCase().includes(term.toLowerCase())
            : group.name.toLowerCase().includes(term.toLowerCase()) &&
              group.group_id === lockedToGroupId
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }, [binGroups, params]);

  const filteredFiles = useMemo(() => {
    if (files && lockedToGroupId) {
      return files.filter((file) => file.group_id === lockedToGroupId);
    } else {
      return files;
    }
  }, [files, params]);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isGroupsFetching ||
      isFilesFetching ||
      isGroupsUninitialized ||
      isFilesUninitialized ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : filteredGroups?.length || filteredFiles?.length ? (
        <>
          <Header title={`Search Results for "${term}"`} hideUpload />
          <MediaGrid
            files={filteredFiles}
            groups={filteredGroups}
            heightOffset={headerHeight + 64}
            widthOffset={sidebarWidth + 220}
          />
        </>
      ) : (
        <SearchEmptyState searchTerm={term} />
      )}
    </Box>
  );
};
