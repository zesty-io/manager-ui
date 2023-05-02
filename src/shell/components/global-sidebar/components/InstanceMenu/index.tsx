import React, { FC, useState } from "react";
import { Stack, Typography, ListItem, Skeleton } from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

import { useGetInstanceQuery } from "../../../../services/accounts";
import { DropdownMenu } from "./DropdownMenu";
import { InstanceAvatar } from "../InstanceAvatar";

interface InstanceMenuProps {
  openNav: boolean;
}
export const InstanceMenu: FC<InstanceMenuProps> = ({ openNav }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data: instance, isLoading: isLoadingInstance } =
    useGetInstanceQuery();

  return (
    <>
      <ListItem
        sx={{
          px: openNav ? 1.5 : 1,
          py: 0.75,
          mt: 1.5,
          mb: 0.5,
          mx: 1,
          height: openNav ? 48 : 44,
          width: 184,
        }}
      >
        <Stack
          direction="row"
          height={36}
          width="100%"
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
            <InstanceAvatar canUpdateAvatar={false} />
            {openNav && (
              <Typography
                // @ts-ignore
                variant="body3"
                fontWeight={600}
                color="common.white"
                display="-webkit-box"
                sx={{
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: "2",
                  wordBreak: "break-word",
                }}
                overflow="hidden"
              >
                {isLoadingInstance ? (
                  <Skeleton sx={{ bgcolor: "grey.500", width: 70 }} />
                ) : (
                  instance?.name
                )}
              </Typography>
            )}
          </Stack>
          {openNav && <ArrowDropDownRoundedIcon color="inherit" />}
        </Stack>
      </ListItem>
      {Boolean(anchorEl) && (
        <DropdownMenu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />
      )}
    </>
  );
};
