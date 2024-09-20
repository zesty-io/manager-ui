import { FC, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Skeleton, Box, SxProps, Theme } from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";

import { useGetHeadTagsQuery } from "../../../services/instance";
import { useGetInstanceQuery } from "../../../services/accounts";
import { AppState } from "../../../store/types";
import { actions } from "../../../store/ui";

interface InstanceAvatar {
  canUpdateAvatar?: boolean;
  onFaviconModalOpen?: () => void;
  avatarSx?: SxProps<Theme>;
}
export const InstanceAvatar: FC<InstanceAvatar> = ({
  canUpdateAvatar = true,
  onFaviconModalOpen,
  avatarSx,
}) => {
  const ui = useSelector((state: AppState) => state.ui);
  const dispatch = useDispatch();
  const { data: headTags, isLoading: isLoadingHeadTags } =
    useGetHeadTagsQuery();
  const { data: instance, isLoading: isLoadingInstance } =
    useGetInstanceQuery();

  const faviconURL = useMemo(() => {
    if (headTags?.length) {
      const allAttributes = headTags.map((tag) => tag.attributes);
      const faviconTag = allAttributes.find((attr) => {
        if ("href" in attr && "sizes" in attr && attr["sizes"] === "196x196") {
          return attr;
        }
      });

      return faviconTag?.href;
    }

    return "";
  }, [headTags]);

  if (isLoadingHeadTags || isLoadingInstance) {
    return (
      <Skeleton
        variant="circular"
        width={32}
        height={32}
        sx={{ bgcolor: "grey.500" }}
      />
    );
  }

  return (
    <Box
      position="relative"
      sx={{
        "&:hover [data-cy='AvatarHoverOverlay']": {
          display: "flex",
        },
      }}
    >
      <Avatar
        src={faviconURL}
        alt="favicon"
        sx={{
          height: 32,
          width: 32,
          backgroundColor: faviconURL ? "common.white" : "info.main",
          ...avatarSx,
        }}
      >
        {(!faviconURL && instance?.name[0]?.toUpperCase()) || "A"}
      </Avatar>
      {canUpdateAvatar && (
        <Box
          data-cy="AvatarHoverOverlay"
          sx={{
            backgroundColor: "#10182880",
            borderRadius: "50%",
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            display: "none",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            dispatch(actions.toggleUpdateFaviconModal(true));
            onFaviconModalOpen && onFaviconModalOpen();
          }}
        >
          <ImageRoundedIcon sx={{ width: 16, height: 16, fill: "white" }} />
        </Box>
      )}
    </Box>
  );
};
