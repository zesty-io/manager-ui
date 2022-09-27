import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";
import { useParams } from "../../../../../shell/hooks/useParams";

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const SearchMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const openNav = useSelector((state: any) => state.ui.openNav);
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term");

  const { data: bins } = mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: ecoBins } = mediaManagerApi.useGetEcoBinsQuery(ecoId, {
    skip: !ecoId,
  });

  const combinedBins = [...(ecoBins || []), ...(bins || [])];

  const { data: binGroups, isLoading: isGroupsLoading } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      combinedBins?.map((bin) => bin.id),
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
    <Box component="main" sx={{ flex: 1 }}>
      <Header title={`Search Results for "${term}"`} hideUpload />
      <MediaGrid
        groups={filteredGroups}
        heightOffset={HEADER_HEIGHT}
        widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
      />
    </Box>
  );
};
