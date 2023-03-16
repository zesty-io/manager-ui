import { FC, useMemo } from "react";
import { Avatar, Stack, Typography } from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { useGetHeadTagsQuery } from "../../../../services/instance";

interface InstanceMenuProps {
  openNav: boolean;
  instanceName: string;
  // faviconURL: string;
}
export const InstanceMenu: FC<InstanceMenuProps> = ({
  openNav,
  instanceName,
  // faviconURL,
}) => {
  const { data: headTags } = useGetHeadTagsQuery();

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

  return (
    <Stack
      direction="row"
      height={36}
      mx={openNav ? 2.5 : 2}
      mt={2.25}
      mb={1.25}
      justifyContent="space-between"
      alignItems="center"
      gap={1}
      color="grey.500"
      sx={{
        "&:hover": {
          color: "primary.main",
          cursor: "pointer",
        },
      }}
    >
      <Stack direction="row" gap={1} alignItems="center">
        <Avatar src={faviconURL} alt="favicon" sx={{ height: 32, width: 32 }} />
        {openNav && (
          <Typography
            // @ts-ignore
            variant="body3"
            fontWeight={600}
            color="common.white"
            display="-webkit-box"
            sx={{
              "-webkit-box-orient": "vertical",
              "-webkit-line-clamp": "2",
            }}
            overflow="hidden"
          >
            {instanceName}
          </Typography>
        )}
      </Stack>

      {openNav && <ArrowDropDownRoundedIcon color="inherit" />}
    </Stack>
  );
};
