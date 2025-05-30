/**
 * DataGridSkeletonCell.tsx
 *
 * This component renders a custom skeleton cell in MUI X DataGridPro based on the
 * `cellClassName` defined in column definitions.
 *
 * ------------------------------------------------------------------------------
 * USAGE GUIDE:
 *
 * 1. Add `cellClassName` to the column definition
 *    --------------------------------------------------
 *    The `cellClassName` should match a key in `FIELD_SKELETON_MAP`.
 *    This defines which skeleton component to render for that column.
 *
 *    Example:
 *    const columns = [
 *      { field: "version", cellClassName: "version" },
 *      { field: "created_by", cellClassName: "createdBy" },
 *    ];
 *
 * 2. Register `DataGridSkeletonCell` in the DataGrid `slots`
 *    --------------------------------------------------------
 *    Pass the custom skeleton cell renderer in the `skeletonCell` slot.
 *
 *    Example:
 *    <DataGridPro
 *      columns={columns}
 *      slots={{
 *        skeletonCell: DataGridSkeletonCell,
 *      }}
 *      slotProps={{
 *        loadingOverlay: {
 *          variant: "skeleton",
 *          noRowsVariant: "skeleton",
 *        },
 *      }}
 *    />
 *
 * 3. Extend `FIELD_SKELETON_MAP` for new skeleton types (optional)
 *    --------------------------------------------------------------
 *    If a new cell type needs a custom skeleton, add it to `FIELD_SKELETON_MAP`
 *    using the same name as the column's `cellClassName`.
 *
 *    Example:
 *    FIELD_SKELETON_MAP["my_custom_type"] = (
 *      <Skeleton variant="text" width={100} />
 *    );
 *
 *    Then use in column:
 *    { field: "custom", cellClassName: "my_custom_type" }
 *
 * ------------------------------------------------------------------------------
 */

import { useGridApiContext } from "@mui/x-data-grid-pro";
import { Box, Skeleton } from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";

// A mapping from cellClassName to its corresponding Skeleton component.
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
      sx={{ position: "relative" }}
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
    <Box display="flex" flexDirection="row" alignItems="center" gap="12px">
      <Skeleton
        variant="rounded"
        width="32px"
        height="32px"
        sx={{ borderRadius: "8px" }}
      />
      <Skeleton variant="rounded" width="62px" height="12px" />
    </Box>
  ),
  yes_no: (
    <Skeleton
      variant="rounded"
      width="96px"
      height="32px"
      sx={{ borderRadius: "4px" }}
    />
  ),
  sort: (
    <Skeleton
      variant="rounded"
      width="112px"
      height="40px"
      sx={{ borderRadius: "8px" }}
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

/**
 * DataGridSkeletonCell
 *
 * A custom skeleton cell renderer for MUI DataGridPro.
 * Dynamically selects a skeleton based on the `cellClassName` of the column.
 */
const DataGridSkeletonCell = (props: any) => {
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
      style={{ ...style }}
    >
      {field === "__check__"
        ? FIELD_SKELETON_MAP.checkboxSelection
        : FIELD_SKELETON_MAP[dataType as any] || FIELD_SKELETON_MAP.default}
    </Box>
  );
};

export default DataGridSkeletonCell;
