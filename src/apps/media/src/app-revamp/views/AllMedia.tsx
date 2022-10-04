import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { DnDProvider } from "../components/DnDProvider";
import { EmptyState } from "../components/EmptyState";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";
import { FileModal } from "../components/FileModal";

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const AllMedia = () => {
  // current file details used for file modal
  const [currentFile, setCurrentFile] = useState<any>({
    id: "",
    src: "",
    filename: "",
  });

  const instanceId = useSelector((state: any) => state.instance.ID);
  const openNav = useSelector((state: any) => state.ui.openNav);
  const { data: bins, isLoading: isBinsLoading } =
    mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: files, isLoading: isFilesLoading } =
    mediaManagerApi.useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );

  const handleCloseModal = () => {
    setCurrentFile((prev: any) => ({
      ...prev,
      id: "",
    }));
  };

  return (
    <Box component="main" sx={{ flex: 1 }}>
      <Header title="All Media" />
      <DnDProvider>
        {(isFilesLoading || isBinsLoading) && !files?.length ? (
          <EmptyState />
        ) : (
          <MediaGrid
            files={files}
            heightOffset={HEADER_HEIGHT}
            widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
            onSetCurrentFile={setCurrentFile}
          />
        )}
      </DnDProvider>
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
