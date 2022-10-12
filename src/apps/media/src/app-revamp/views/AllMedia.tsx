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

  // test
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
        <DnDProvider>
          {!isFilesFetching && !isBinsFetching && !files?.length ? (
            <EmptyState />
          ) : (
            <MediaGrid
              files={files}
              heightOffset={headerHeight + 64}
              widthOffset={sidebarWidth + 220}
              hideHeaders
            />
          )}
        </DnDProvider>
      )}
      <FileModal files={files} />
    </Box>
  );
};
