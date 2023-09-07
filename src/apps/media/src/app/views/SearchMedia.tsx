import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import {
  useGetAllBinGroupsQuery,
  useGetBinsQuery,
  useSearchBinFilesQuery,
} from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { MediaList } from "../components/MediaList";
import { Header } from "../components/Header";
import { useParams } from "../../../../../shell/hooks/useParams";
import { SearchEmptyState } from "../components/SearchEmptyState";
import { File } from "../../../../../shell/services/types";
import { State } from "../../../../../shell/store/media-revamp";
import Controls from "../components/Controls";
import {
  fileExtension,
  getExtensions,
  getDateFilterFn,
  getDateFilter,
} from "../utils/fileUtils";
import {
  MediaSortOrder,
  DateRange,
  Filetype,
} from "../../../../../shell/store/media-revamp";

interface Props {
  lockedToGroupId?: string;
  addImagesCallback?: (selectedFiles: File[]) => void;
  setCurrentFilesCallback: (files: File[]) => void;
}

export const SearchMedia = ({
  lockedToGroupId,
  addImagesCallback,
  setCurrentFilesCallback,
}: Props) => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term") || "";
  const sortOrder = params.get("sort");
  const filetypeFilter = params.get("filetype") as Filetype;
  const dateRangeFilter = getDateFilter(params);
  console.log({
    term,
    sortOrder,
    filetypeFilter,
    dateRangeFilter,
  });
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const {
    data: unfilteredBinGroups,
    isFetching: isGroupsFetching,
    isUninitialized: isGroupsUninitialized,
  } = useGetAllBinGroupsQuery(
    bins?.map((bin) => bin.id),
    {
      skip: !bins?.length,
    }
  );
  const currentMediaView = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.currentMediaView
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
    if (unfilteredBinGroups) {
      return unfilteredBinGroups
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
  }, [unfilteredBinGroups, term]);

  const sortedGroups = useMemo(() => {
    if (!filteredGroups) return filteredGroups;
    // don't show groups when filtering by filetypes or dates
    if (Boolean(filetypeFilter) && filetypeFilter !== "Folder") return [];
    if (Boolean(dateRangeFilter)) return [];
    switch (sortOrder) {
      case "alphaAsc":
        return [...filteredGroups].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      case "alphaDesc":
        return [...filteredGroups].sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      /*
        Bins do not have a created_at field so we rely on the API to sort them
        by creation time
      */
      case "createdDesc":
      // Default to API order
      default:
        return filteredGroups;
    }
  }, [filteredGroups, sortOrder, filetypeFilter, dateRangeFilter]);

  const filteredFiles = useMemo(() => {
    if (files && lockedToGroupId) {
      return files.filter((file) => file.group_id === lockedToGroupId);
    } else {
      return files;
    }
  }, [files, term]);

  const sortedGroupFiles = useMemo(() => {
    if (!filteredFiles) return filteredFiles;
    switch (sortOrder) {
      case "AtoZ":
        return [...filteredFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "ZtoA":
        return [...filteredFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "dateadded":
        return filteredFiles;
      // Default to API order
      default:
        return filteredFiles;
    }
  }, [filteredFiles, sortOrder]);

  const userFilteredFiles = useMemo(() => {
    if (!sortedGroupFiles) return sortedGroupFiles;
    if (filetypeFilter === "Folder") return [];
    if (filetypeFilter && dateRangeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedGroupFiles.filter((file) => {
        return (
          extensions.has(fileExtension(file.filename)) &&
          dateFilterFn(file.created_at)
        );
      });
    } else if (filetypeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      return sortedGroupFiles.filter((file) => {
        return extensions.has(fileExtension(file.filename));
      });
    } else if (dateRangeFilter) {
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedGroupFiles.filter((file) => {
        return dateFilterFn(file.created_at);
      });
    } else {
      return sortedGroupFiles;
    }
  }, [sortedGroupFiles, filetypeFilter, dateRangeFilter]);

  useEffect(() => {
    setCurrentFilesCallback(userFilteredFiles || []);
  }, [userFilteredFiles]);

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "grey.50",
      }}
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
      ) : sortedGroups?.length || userFilteredFiles?.length ? (
        <Box
          sx={{
            height: "100%",
            width: "100%",
          }}
        >
          <Header
            title={term}
            hideUpload
            addImagesCallback={addImagesCallback}
            hideFolderCreate
            files={userFilteredFiles}
            showBackButton
          />
          <Controls />
          {currentMediaView === "grid" ? (
            <MediaGrid files={userFilteredFiles} groups={sortedGroups} />
          ) : (
            <MediaList files={userFilteredFiles} />
          )}
        </Box>
      ) : (
        <SearchEmptyState searchTerm={term} />
      )}
    </Box>
  );
};
