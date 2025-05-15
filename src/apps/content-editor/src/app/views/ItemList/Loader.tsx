import {
  useGridApiContext,
  gridColumnsTotalWidthSelector,
  gridColumnPositionsSelector,
} from "@mui/x-data-grid-pro";
import { Fragment, ReactNode, useMemo } from "react";
import { Box, Skeleton } from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import Typography from "@mui/material/Typography";
import { ContentModelField } from "../../../../../../shell/services/types";

export const gridLoadingStyles = {
  pointerEvents: "none",
  "& .MuiDataGrid-virtualScroller": {
    overflow: "hidden",
  },
  "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer": {
    visibility: "hidden!important",
  },
  "& .MuiDataGrid-columnSeparator": {
    visibility: "hidden!important",
  },
};

export const FIELD_SKELETON_MAP: Record<string, JSX.Element> = {
  checkboxSelection: <Skeleton variant="rounded" width="18px" height="18px" />,
  __check__: <Skeleton variant="rounded" width="18px" height="18px" />,
  images: (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      sx={{
        position: "relative",
      }}
    >
      <Skeleton
        height="100%"
        width="100%"
        variant="rectangular"
        sx={{ position: "absolute", top: 0, left: 0 }}
      />
      <ImageRoundedIcon
        fontSize="small"
        sx={{ color: "text.disabled", opacity: 0.2 }}
      />
    </Box>
  ),
  one_to_one: <Skeleton variant="rounded" width="55px" height="18px" />,
  one_to_many: (
    <Box display="flex" flexDirection="row" columnGap="4px">
      <Skeleton variant="rounded" width="55px" height="18px" />
      <Skeleton variant="rounded" width="55px" height="18px" />
      <Skeleton variant="rounded" width="55px" height="18px" />
    </Box>
  ),
  version: (
    <Box display="flex" flexDirection="column" gap="2px">
      <Skeleton variant="rounded" width="36px" height="20px" />
      <Skeleton variant="rounded" width="36px" height="20px" />
    </Box>
  ),
  link: <Skeleton variant="rounded" width="140px" height="12px" />,
  internal_link: <Skeleton variant="rounded" width="90px" height="24px" />,
  color: (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
      gap="12px"
    >
      <Skeleton
        variant="rounded"
        width="32px"
        height="32px"
        sx={{
          borderRadius: "8px",
        }}
      />
      <Skeleton variant="rounded" width="62px" height="12px" />
    </Box>
  ),
  yes_no: (
    <Skeleton
      variant="rounded"
      width="96px"
      height="32px"
      sx={{
        borderRadius: "4px",
      }}
    />
  ),
  sort: (
    <Skeleton
      variant="rounded"
      width="112px"
      height="40px"
      sx={{
        borderRadius: "8px",
      }}
    />
  ),
  number: <Skeleton variant="rounded" width="62px" height="12px" />,
  dropdown: <Skeleton variant="rounded" width="117px" height="24px" />,
  createdBy: (
    <Box display="flex" flexDirection="row" alignItems="center" gap="12px">
      <Skeleton
        variant="circular"
        width="32px"
        height="32px"
        sx={{ minWidth: "32px" }}
      />
      <Skeleton variant="rounded" width="80px" height="12px" />
    </Box>
  ),
  header: (
    <Box
      width="100%"
      flexGrow={1}
      height={50}
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      position="absolute"
      pr={2}
    >
      <Skeleton
        variant="rounded"
        height="12px"
        width="calc(100% - 16px)"
        sx={{ maxWidth: "200px" }}
      />
    </Box>
  ),
  default: (
    <Skeleton
      width="100%"
      height="12px"
      variant="rounded"
      sx={{ maxWidth: "240px" }}
    />
  ),
};

export const SkeletonHeaderLabel = () => (
  <Box
    boxSizing="border-box"
    height={54}
    display="flex"
    justifyContent="flex-start"
    alignItems="center"
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: "100%",
      px: 2,
    }}
  >
    <Skeleton
      variant="rounded"
      sx={{
        height: "12px",
        minWidth: "36px",
        width: "100%",
        maxWidth: "200px",
      }}
    />
  </Box>
);

export const SkeletonContentHeader = () => {
  return (
    <>
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-start"
        boxSizing="border-box"
        rowGap={0.25}
      >
        <Box
          display="flex"
          flexDirection="row"
          gap={1}
          justifyContent="flex-start"
          alignItems="center"
        >
          <Skeleton variant="circular" width="20px" height="20px" />
          <Typography
            variant="body2"
            color="grey.200"
            fontWeight={500}
            textAlign="center"
          >
            /
          </Typography>
          {[...new Array(2)].map((_, i) => (
            <Fragment key={`skeleton-path-${i}`}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                columnGap={0.5}
              >
                <Skeleton variant="circular" width="20px" height="20px" />
                <Skeleton variant="rounded" width="69px" height="12px" />
              </Box>
              <Typography
                variant="body2"
                color="grey.200"
                fontWeight={500}
                textAlign="center"
              >
                /
              </Typography>
            </Fragment>
          ))}
        </Box>
        <Box
          height="36px"
          width="608px"
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Skeleton
            variant="rounded"
            width="442px"
            height="20px"
            sx={{
              bgcolor: "grey.200",
              borderRadius: "30px",
            }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" gap={1} alignItems="center">
        <Skeleton variant="rounded" width="16px" height="16px" sx={{ m: 1 }} />
        <Skeleton
          variant="rounded"
          width="205px"
          height="32px"
          sx={{ borderRadius: "8px", bgcolor: "grey.100" }}
        />
        <Skeleton
          variant="rounded"
          width="88px"
          height="32px"
          sx={{ borderRadius: "4px" }}
        />
      </Box>
    </>
  );
};

export const SkeletonItemListFilters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="stretch"
      columnGap="12px"
      py={2}
    >
      <Skeleton variant="rounded" width="152px" height="26px" />
      <Skeleton variant="rounded" width="85px" height="26px" />
      <Skeleton variant="rounded" width="117px" height="26px" />
      <Skeleton variant="rounded" width="121px" height="26px" />
      <Skeleton variant="rounded" width="108px" height="26px" />
    </Box>
  );
};

export const DataGridSkeletonCell = (props: any) => {
  const { width, field, align, className, style, empty } = props;
  const apiRef = useGridApiContext();
  const columns = apiRef.current.state.columns.lookup;
  const dataType = columns[field]?.cellClassName;
  const computedWidth = columns[field]?.computedWidth;
  const rowHeight = apiRef.current.state.dimensions.rowHeight;

  if (empty) return null;
  return (
    <Box
      height={rowHeight}
      display="flex"
      justifyContent={align === "left" ? "flex-start" : "flex-end"}
      alignItems="center"
      width={computedWidth || width}
      px={2}
      className={className}
      style={{
        ...style,
      }}
    >
      {field === "__check__"
        ? FIELD_SKELETON_MAP.checkboxSelection
        : FIELD_SKELETON_MAP[dataType as any] || FIELD_SKELETON_MAP.default}
    </Box>
  );
};
