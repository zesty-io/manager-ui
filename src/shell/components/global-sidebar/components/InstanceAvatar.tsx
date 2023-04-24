import { useMemo } from "react";
import { Avatar, Skeleton } from "@mui/material";

import { useGetHeadTagsQuery } from "../../../services/instance";
import { useGetInstanceQuery } from "../../../services/accounts";

export const InstanceAvatar = () => {
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
    <Avatar
      src={faviconURL}
      alt="favicon"
      sx={{
        height: 32,
        width: 32,
        backgroundColor: faviconURL ? "initial" : "info.main",
      }}
    >
      {(!faviconURL && instance?.name[0]?.toUpperCase()) || "A"}
    </Avatar>
  );
};
