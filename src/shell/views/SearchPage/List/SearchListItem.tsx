import { FC, ReactNode } from "react";
import { LinksContainer } from "../LinksContainer";
import { Box, Skeleton, Stack, Typography, SvgIcon } from "@mui/material";
import { Link } from "react-router-dom";
import { SvgIconComponent } from "@mui/icons-material";
import { ResourceType } from "shell/services/types";

interface SearchListItem {
  title: string | ReactNode;
  url: string;
  chips: string;
  icon: SvgIconComponent;
  style: any;
  loading?: boolean;
  path?: string;
}
export const SearchListItem: FC<SearchListItem> = ({
  title,
  url,
  chips,
  icon,
  style,
  loading = false,
  path,
}) => {
  return (
    <Box
      component={Link}
      to={url || ""}
      style={style}
      sx={{
        boxSizing: "border-box",
        alignItems: "center",
        display: "flex",
        flex: 1,
        padding: 2,
        gap: 2,
        backgroundColor: "background.paper",
        borderColor: "grey.100",
        borderWidth: "0px 1px 1px 1px",
        borderStyle: "solid",
        height: 9,
        color: "inherit",
        textDecoration: "none",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        "&:hover button": {
          visibility: "visible",
        },
        "&:hover a": {
          visibility: "visible",
        },
        "&:first-of-type": {
          borderRadius: "8px 8px 0 0",
          borderWidth: "1px",
        },
        "&:last-of-type": {
          borderRadius: "0 0 8px 8px",
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 2,
        }}
        width="100%"
      >
        {loading ? (
          <Skeleton variant="circular" width={20} height={20} />
        ) : (
          <SvgIcon
            component={icon}
            sx={{ width: "16px", height: "16px", color: "action.active" }}
            fontSize="small"
          />
        )}
        {/* Text Container */}
        <Stack
          direction="column"
          sx={{
            alignItems: "flex-start",
          }}
          width="100%"
        >
          <Typography variant="body2" color="text.primary" fontWeight={700}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={16}
                width={555}
                sx={{ mb: 1 }}
              />
            ) : (
              <>{title}</>
            )}
          </Typography>
          {!!path && (
            <Typography variant="body3" color="info.main">
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={14}
                  width={425}
                  sx={{ mb: 1 }}
                />
              ) : (
                <>{path}</>
              )}
            </Typography>
          )}
          <Typography variant="body3" color="text.secondary">
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={14}
                width={425}
                sx={{ mb: 0.75 }}
              />
            ) : (
              chips
            )}
          </Typography>
        </Stack>
        <LinksContainer url={url || ""} />
      </Stack>
    </Box>
  );
};
