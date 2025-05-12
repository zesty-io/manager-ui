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

const CellWrapper = ({
  align = "left",
  direction = "row",
  gap = 0,
  children,
}: {
  align?: "left" | "center" | "right";
  direction?: "row" | "column";
  gap?: number | string;
  children: ReactNode;
}) => {
  const justify = direction === "column" ? "center" : align;
  const alignment = direction === "column" ? align : "center";
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection={direction}
      alignItems={alignment}
      justifyContent={justify}
      gap={gap}
      boxSizing="border-box"
    >
      {children}
    </Box>
  );
};

export const FIELD_SKELETON_MAP: Record<string, JSX.Element> = {
  checkboxSelection: (
    <CellWrapper align="center">
      <Skeleton variant="rounded" width="18px" height="18px" />
    </CellWrapper>
  ),
  images: (
    <CellWrapper>
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
    </CellWrapper>
  ),
  one_to_one: (
    <CellWrapper>
      <Skeleton variant="rounded" width="55px" height="18px" />
    </CellWrapper>
  ),
  one_to_many: (
    <CellWrapper>
      <Skeleton variant="rounded" width="55px" height="18px" />
      <Skeleton variant="rounded" width="55px" height="18px" />
      <Skeleton variant="rounded" width="55px" height="18px" />
    </CellWrapper>
  ),
  version: (
    <CellWrapper direction="column" gap="2px">
      <Skeleton variant="rounded" width="36px" height="20px" />
      <Skeleton variant="rounded" width="36px" height="20px" />
    </CellWrapper>
  ),
  link: (
    <CellWrapper>
      <Skeleton variant="rounded" width="140px" height="12px" />
    </CellWrapper>
  ),
  internal_link: (
    <CellWrapper>
      <Skeleton variant="rounded" width="90px" height="24px" />
    </CellWrapper>
  ),
  color: (
    <CellWrapper gap="12px">
      <Skeleton
        variant="rounded"
        width="32px"
        height="32px"
        sx={{
          borderRadius: "8px",
        }}
      />
      <Skeleton variant="rounded" width="62px" height="12px" />
    </CellWrapper>
  ),
  yes_no: (
    <CellWrapper>
      <Skeleton
        variant="rounded"
        width="96px"
        height="32px"
        sx={{
          borderRadius: "4px",
        }}
      />
    </CellWrapper>
  ),
  sort: (
    <CellWrapper>
      <Skeleton
        variant="rounded"
        width="112px"
        height="40px"
        sx={{
          borderRadius: "8px",
        }}
      />
    </CellWrapper>
  ),
  number: (
    <CellWrapper align="right">
      <Skeleton variant="rounded" width="62px" height="12px" />
    </CellWrapper>
  ),
  dropdown: (
    <CellWrapper>
      <Skeleton variant="rounded" width="117px" height="24px" />
    </CellWrapper>
  ),
  createdBy: (
    <CellWrapper gap="12px">
      <Skeleton
        variant="circular"
        width="32px"
        height="32px"
        sx={{ minWidth: "32px" }}
      />
      <Skeleton variant="rounded" width="80px" height="12px" />
    </CellWrapper>
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
        sx={{ maxWidth: "180px" }}
      />
    </Box>
  ),
  default: (
    <CellWrapper gap="12px">
      <Skeleton
        width="100%"
        height="12px"
        variant="rounded"
        sx={{ maxWidth: "240px" }}
      />
    </CellWrapper>
  ),
};

export const SkeletonLoadingOverlay = ({
  fields,
}: {
  fields?: ContentModelField[];
}) => {
  const apiRef = useGridApiContext();

  const dimensions = apiRef.current?.getRootDimensions();
  const viewportHeight = dimensions?.viewportInnerSize.height ?? 0;
  const rowHeight = apiRef.current.state.dimensions.rowHeight;
  const skeletonRowsCount = Math.ceil(
    viewportHeight / apiRef.current.state.dimensions.rowHeight
  );

  const totalWidth = gridColumnsTotalWidthSelector(apiRef);
  const positions = gridColumnPositionsSelector(apiRef);
  const inViewportCount = useMemo(
    () => positions.filter((value) => value <= totalWidth).length,
    [totalWidth, positions]
  );
  const columns = apiRef.current.getVisibleColumns().slice(0, inViewportCount);

  const COL_TYPE_MAP = useMemo(() => {
    const typesMap = fields?.reduce((acc, field) => {
      acc[field.name] = field.datatype;
      return acc;
    }, {} as Record<string, string>);
    return {
      ...typesMap,
      createdBy: "createdBy",
      createdOn: "text",
      lastSaved: "text",
      lastPublished: "text",
      zuid: "text",
      version: "version",
      __check__: "checkboxSelection",
    };
  }, [fields]);

  const children = useMemo(() => {
    const array: ReactNode[] = [];

    for (let i = 0; i < skeletonRowsCount; i += 1) {
      for (const column of columns) {
        array.push(
          <Box
            className="skeleton-row"
            key={`col-${column.field}-${i}`}
            width={column.computedWidth}
            px={column?.field === "__check__" ? 0 : 2}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "border",
            }}
          >
            {FIELD_SKELETON_MAP[
              COL_TYPE_MAP[
                column.field as keyof typeof COL_TYPE_MAP
              ] as keyof typeof FIELD_SKELETON_MAP
            ] || FIELD_SKELETON_MAP.default}
          </Box>
        );
      }
      array.push(<Box key={`fill-${i}`} />);
    }
    return array;
  }, [skeletonRowsCount, columns]);

  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns: `${columns
          .map(({ computedWidth }) => `${computedWidth}px`)
          .join(" ")} 1fr`,
        gridAutoRows: `${rowHeight}px`,
      }}
    >
      {children}
    </Box>
  );
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
      <Skeleton variant="rounded" width="152px" height="28px" />
      <Skeleton variant="rounded" width="85px" height="28px" />
      <Skeleton variant="rounded" width="117px" height="28px" />
      <Skeleton variant="rounded" width="121px" height="28px" />
      <Skeleton variant="rounded" width="108px" height="28px" />
    </Box>
  );
};
