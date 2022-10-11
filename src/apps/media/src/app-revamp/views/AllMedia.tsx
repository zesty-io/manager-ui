import { useEffect, useState, useRef } from "react";
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

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const AllMedia = () => {
  // current file details used for file modal
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const openNav = useSelector((state: any) => state.ui.openNav);
  const { data: bins, isFetching: isBinsFetching } =
    useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });
  const [toggleFileModal, setToggleFileModal] = useState<boolean>(false);

  const combinedBins = [...(ecoBins || []), ...(bins || [])];

  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    combinedBins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

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
        <>
          {!isFilesFetching && !isBinsFetching && !files?.length ? (
            <EmptyState />
          ) : (
            <MediaGrid
              files={files}
              toggleFileModal={toggleFileModal}
              setToggleFileModal={setToggleFileModal}
              heightOffset={HEADER_HEIGHT}
              widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
            />
          )}
        </>
      )}
      <FileModal files={files} toggleFileModal={toggleFileModal} />
    </Box>
  );
};
