import React, { FC, useMemo, useState, useRef } from "react";
import { Avatar, Stack, Typography } from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { useGetHeadTagsQuery } from "../../../../services/instance";
import { useGetInstanceQuery } from "../../../../services/accounts";
import { DropdownMenu } from "./DropdownMenu";

interface InstanceMenuProps {
  openNav: boolean;
}
export const InstanceMenu: FC<InstanceMenuProps> = ({ openNav }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data: headTags } = useGetHeadTagsQuery();
  const { data: instance } = useGetInstanceQuery();

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
    <>
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
        onClick={(evt: React.MouseEvent<HTMLDivElement>) =>
          setAnchorEl(evt.currentTarget)
        }
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Avatar
            src={faviconURL}
            alt="favicon"
            sx={{ height: 32, width: 32 }}
          />
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
              {instance?.name}
            </Typography>
          )}
        </Stack>
        {openNav && <ArrowDropDownRoundedIcon color="inherit" />}
      </Stack>
      {Boolean(anchorEl) && (
        <DropdownMenu
          anchorEl={anchorEl}
          faviconURL={faviconURL}
          onClose={() => setAnchorEl(null)}
        />
      )}
    </>
  );
};
