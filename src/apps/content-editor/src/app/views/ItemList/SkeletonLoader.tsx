import { Skeleton, Box, Typography } from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import { useLocation } from "react-router";
import { GridColDef } from "@mui/x-data-grid-pro";

export const FIELD_SKELETON_MAP: Record<string, JSX.Element> = {
  images: (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="54px"
      // width="68px"
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
  one_to_one: (
    <Box
      width="100%"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      boxSizing="border-box"
      height="18px"
    >
      <Skeleton variant="rounded" width="55px" height="18px" />
    </Box>
  ),
  one_to_many: (
    <Box
      width="100%"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      gap="4px"
      boxSizing="border-box"
      height="18px"
    >
      <Skeleton variant="rounded" width="55px" height="18px" />
      <Skeleton variant="rounded" width="55px" height="18px" />
      <Skeleton variant="rounded" width="55px" height="18px" />
    </Box>
  ),
  version: (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="center"
      rowGap="2px"
      // width="59px"
      width="100%"
    >
      <Skeleton variant="rounded" width="36px" height="20px" />
    </Box>
  ),
  link: <Skeleton variant="rounded" width="140px" height="12px" />,
  internal_link: <Skeleton variant="rounded" width="90px" height="24px" />,
  color: (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      width="138px"
      height="54px"
      columnGap="12px"
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
  number: (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-end"
      width="100%"
      height="100%"
    >
      <Skeleton variant="rounded" width="62px" height="12px" />
    </Box>
  ),
  dropdown: <Skeleton variant="rounded" width="117px" height="24px" />,
  createdBy: (
    <Box
      width="100%"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      gap="12px"
      boxSizing="border-box"
    >
      <Skeleton variant="circular" width="32px" height="32px" />
      <Skeleton variant="rounded" width="62px" height="12px" />
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
    >
      <Skeleton height={12} width="70%" />
    </Box>
  ),
  default: (
    <Box
      width="100%"
      sx={{
        position: "relaative",
        height: "40px",
        display: "flex",
        flexDirection: "row",
        gap: 1,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Skeleton
        width="90%"
        height="12px"
        variant="rounded"
        sx={{ minWidth: "40px" }}
      />
    </Box>
  ),
};

export const ItemListFiltersSkeleton = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="stretch"
      columnGap="12px"
      py={2}
    >
      <Skeleton variant="rounded" width="164px" height="28px" />
      <Skeleton variant="rounded" width="91px" height="28px" />
      <Skeleton variant="rounded" width="123px" height="28px" />
      <Skeleton variant="rounded" width="127px" height="28px" />
      <Skeleton variant="rounded" width="115px" height="28px" />
    </Box>
  );
};

export const getSkeletonRows = (rows: number) => {
  return [...new Array(rows)].map((_, i) => ({
    id: i,
  }));
};

export const getSkeletonColumns = (columns: any[]) => {
  if (!columns) return [];
  return [
    {
      field: "id",
      width: 50,
      maxWidth: 50,
      minWidth: 50,
      renderHeader: () => (
        <Skeleton variant="rounded" width="18px" height="18px" />
      ),
      renderCell: () => (
        <Skeleton variant="rounded" width="18px" height="18px" />
      ),
    },
    ...columns.map((column, index) => {
      return {
        field: `col-${index + 1}`,
        width: column?.width,
        sortable: false,
        filterable: false,
        resizable: false,

        renderHeader: () => (
          <Box
            sx={{
              width: column?.width,
              position: "relative",
              height: "54px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Skeleton
              width={column?.type === "images" ? "68px" : "100%"}
              height="12px"
              variant="rounded"
              sx={{ maxWidth: "200px" }}
            />
          </Box>
        ),
        renderCell: () => (
          <Box
            width={column?.width}
            height="100%"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {FIELD_SKELETON_MAP[column.type] || FIELD_SKELETON_MAP.default}
          </Box>
        ),
      };
    }),
  ];
};

export const ContentHeaderSkeleton = () => {
  return (
    <>
      <Box flex={1}>
        <Box
          display="flex"
          flexDirection="row"
          gap={1}
          justifyContent="flex-start"
          alignItems="center"
          height="20px"
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
            <>
              <Box
                key={`skeleton-path-${i}`}
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
            </>
          ))}
        </Box>
        <Box
          height="36px"
          width="608px"
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          mt="2px"
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

export const LoadingOverlay = ({
  columns,
  rowCount,
  dimentions,
}: {
  columns: GridColDef[];
  rowCount: number;
  dimentions: any;
}) => {
  return (
    <>
      {[...new Array(rowCount)].map((_, i) => (
        <Box
          key={`skeleton-row-${i}`}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "54px",
          }}
        >
          <Box
            height="54px"
            sx={{
              flexShrink: 0,
              width: "50px",
              minWidth: "50px",
              display: "flex",

              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Skeleton variant="rounded" width="18px" height="18px" />
          </Box>
          {columns?.map((column: any) => {
            const dimentionValues = dimentions?.[column?.field];
            console.debug("dimentionValues: ", dimentionValues);

            return (
              <Box
                width={`${dimentionValues?.width}px`}
                minWidth={`${dimentionValues?.width}px`}
                px={1.5}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent:
                    column.align === "right" ? "flex-end" : "flex-start",
                  position: "relative",
                }}
              >
                {FIELD_SKELETON_MAP[column?.type] || FIELD_SKELETON_MAP.default}
              </Box>
            );
          })}
        </Box>
      ))}
    </>
  );
};

export const HeaderLabel = ({ width }: { width: number }) => (
  <Box
    width={width}
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
      px: 1.5,
    }}
  >
    <Skeleton
      variant="rounded"
      sx={{ height: "12px", width: "100%", maxWidth: "200px" }}
    />
  </Box>
);
