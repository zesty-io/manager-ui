import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import {
  useGetAllBinGroupsQuery,
  useGetBinsQuery,
  useSearchBinFilesQuery,
} from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";
import { useParams } from "../../../../../shell/hooks/useParams";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { File } from "../../../../../shell/services/types";

interface Props {
  lockedToGroupId?: string;
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const SearchMedia = ({ lockedToGroupId, addImagesCallback }: Props) => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term") || "";
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const {
    data: binGroups,
    isFetching: isGroupsFetching,
    isUninitialized: isGroupsUninitialized,
  } = useGetAllBinGroupsQuery(
    bins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );
  const {
    data: files,
    isFetching: isFilesFetching,
    isUninitialized: isFilesUninitialized,
  } = useSearchBinFilesQuery(
    { binIds: bins?.map((bin) => bin.id), term },
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
  }, [binGroups, term]);

  const filteredFiles = useMemo(() => {
    if (files && lockedToGroupId) {
      return files.filter((file) => file.group_id === lockedToGroupId);
    } else {
      return files;
    }
  }, [files, term]);

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
        <Box
          sx={{
            height: "100%",
            width: "100%",
          }}
        >
          <Header
            title={`Search Results for "${term}"`}
            hideUpload
            addImagesCallback={addImagesCallback}
          />
          <MediaGrid files={filteredFiles} groups={filteredGroups} />
        </Box>
      ) : (
        <SearchEmptyState searchTerm={term} />
      )}
    </Box>
  );
};
