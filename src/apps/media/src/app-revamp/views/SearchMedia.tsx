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
import { FileModal } from "../components/FileModal";
import { SearchEmptyState } from "../components/SearchEmptyState";

export const SearchMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term");
  const { data: bins } = useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });

  // current file details used for file modal
  const [currentFile, setCurrentFile] = useState<any>({
    id: "",
    src: "",
    filename: "",
  });

  const handleCloseModal = () => {
    setCurrentFile((prev: any) => ({
      ...prev,
      id: "",
    }));
  };

  const combinedBins = [...(ecoBins || []), ...(bins || [])];

  const { data: binGroups, isFetching: isGroupsFetching } =
    useGetAllBinGroupsQuery(
      combinedBins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  const { data: files, isFetching: isFilesFetching } = useSearchBinFilesQuery(
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
          group.name.toLowerCase().includes(term.toLowerCase())
        );
    } else {
      return [];
    }
  }, [binGroups, params]);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isGroupsFetching || isFilesFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : filteredGroups?.length || files?.length ? (
        <>
          <Header title={`Search Results for "${term}"`} hideUpload />
          <MediaGrid
            files={files}
            groups={filteredGroups}
            heightOffset={headerHeight + 64}
            widthOffset={sidebarWidth + 220}
            onSetCurrentFile={setCurrentFile}
          />
        </>
      ) : (
        <SearchEmptyState searchTerm={term} />
      )}
      {currentFile.id && (
        <FileModal
          id={currentFile.id}
          src={currentFile.src}
          filename={currentFile.filename}
          title={currentFile.filename}
          handleCloseModal={handleCloseModal}
        />
      )}
    </Box>
  );
};
