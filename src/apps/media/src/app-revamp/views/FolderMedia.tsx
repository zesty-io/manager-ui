import { useState } from "react";
import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { Box, CircularProgress } from "@mui/material";
import { FileModal } from "../components/FileModal";

type Params = { id: string };

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const FolderMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const openNav = useSelector((state: any) => state.ui.openNav);

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

  // TODO potentially provide user feedback for an invalid id
  const { data: groupData, isFetching } =
    mediaManagerApi.useGetGroupDataQuery(id);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Header
        title={groupData?.name}
        id={groupData?.id}
        binId={groupData?.bin_id}
        groupId={groupData?.group_id}
      />
      {isFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <DnDProvider>
          {!isFetching && !groupData.files?.length ? (
            <EmptyState />
          ) : (
            <MediaGrid
              files={groupData?.files}
              groups={groupData?.groups}
              heightOffset={HEADER_HEIGHT}
              widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
              onSetCurrentFile={setCurrentFile}
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
