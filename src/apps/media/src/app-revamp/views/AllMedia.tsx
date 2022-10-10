import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import {
  useGetSiteBinsQuery,
  useGetEcoBinsQuery,
  useGetAllBinFilesQuery,
} from "../../../../../shell/services/mediaManager";
import { DnDProvider } from "../components/DnDProvider";
import { EmptyState } from "../components/EmptyState";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";
import { FileModal } from "../components/FileModal";

export const AllMedia = () => {
  // current file details used for file modal
  const [currentFile, setCurrentFile] = useState<any>({
    id: "",
    src: "",
    filename: "",
  });

  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);
  const { data: bins, isFetching: isBinsFetching } =
    useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });

  const combinedBins = [...(ecoBins || []), ...(bins || [])];

  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    combinedBins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  const handleCloseModal = () => {
    setCurrentFile((prev: any) => ({
      ...prev,
      id: "",
    }));
  };

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Header title="All Media" />
      {isFilesFetching || isBinsFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        /* TODO Fix this */
        <DnDProvider currentBinId="" currentGroupId="">
          {!isFilesFetching && !isBinsFetching && !files?.length ? (
            /* TODO Fix this */
            <EmptyState currentBinId="" currentGroupId="" />
          ) : (
            <MediaGrid
              files={files}
              heightOffset={headerHeight + 64}
              widthOffset={sidebarWidth + 220}
              onSetCurrentFile={setCurrentFile}
              hideHeaders
            />
          )}
        </DnDProvider>
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
