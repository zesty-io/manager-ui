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

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const SearchMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const openNav = useSelector((state: any) => state.ui.openNav);
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term");
  const { data: bins } = useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });
  const [toggleFileModal, setToggleFileModal] = useState<boolean>(false);

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
      <Header title={`Search Results for "${term}"`} hideUpload />
      {isGroupsFetching || isFilesFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <MediaGrid
          files={files}
          groups={filteredGroups}
          setToggleFileModal={setToggleFileModal}
          heightOffset={HEADER_HEIGHT}
          widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
        />
      )}
      <FileModal files={files} toggleFileModal={toggleFileModal} />
    </Box>
  );
};
