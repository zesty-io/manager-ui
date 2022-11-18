import { useState, useMemo, useRef } from "react";
import { Box, Typography, Card, Chip, CardMedia } from "@mui/material";
import { useSelector } from "react-redux";
import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../shell/services/metrics";
import { DataGridPro, GridValueGetterParams } from "@mui/x-data-grid-pro";
import { File, Bin } from "../../../../../shell/services/types";
import fileBroken from "../../../../../../public/images/fileBroken.jpg";
import { useHistory, useLocation } from "react-router-dom";

import {
  fileExtension,
  fileTypeToColor,
  getExtensions,
  getDateFilterFn,
} from "../utils/fileUtils";
import { AppState } from "../../../../../shell/store/types";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

export const InsightsTable = () => {
  // Thumbnail prerequisites
  const imageEl = useRef<HTMLImageElement>();
  const [imageOrientation, setImageOrientation] = useState<string>("");
  const [lazyLoading, setLazyLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);

  const location = useLocation();
  const history = useHistory();
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const sortOrder = useSelector(
    (state: AppState) => state.mediaRevamp.sortOrder
  );
  const filetypeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.filetypeFilter
  );
  const dateRangeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.dateRangeFilter
  );
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const defaultBin = bins?.find((bin: Bin) => bin.default);
  const { data: unsortedFiles, isFetching: isFilesFetching } =
    useGetAllBinFilesQuery(
      bins?.map((bin: Bin) => bin.id),
      { skip: !bins?.length }
    );
  const sortedFiles = useMemo(() => {
    if (!unsortedFiles) return unsortedFiles;
    switch (sortOrder) {
      case "alphaAsc":
        return [...unsortedFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "alphaDesc":
        return [...unsortedFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "createdDesc":
        return [...unsortedFiles].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      // Default to API order
      default:
        return unsortedFiles;
    }
  }, [unsortedFiles, sortOrder]);

  const files = useMemo(() => {
    if (!sortedFiles) return sortedFiles;
    if (filetypeFilter && dateRangeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedFiles.filter((file: File) => {
        return (
          extensions.has(fileExtension(file.filename)) &&
          dateFilterFn(file.created_at)
        );
      });
    } else if (filetypeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      return sortedFiles.filter((file: File) => {
        return extensions.has(fileExtension(file.filename));
      });
    } else if (dateRangeFilter) {
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedFiles.filter((file: File) => {
        return dateFilterFn(file.created_at);
      });
    } else {
      return sortedFiles;
    }
  }, [sortedFiles, filetypeFilter, dateRangeFilter]);

  /**
   * @description Used to set vertical or horizontal image orientation
   * @note imageOrientation will be placed as a condition in the Image's parent component
   */
  const handleImageLoad = () => {
    setLazyLoading(false);
    const naturalHeight = imageEl.current.naturalHeight;
    const naturalWidth = imageEl.current.naturalWidth;
    if (naturalHeight > naturalWidth) {
      setImageOrientation("vertical");
    } else {
      setImageOrientation("horizontal");
    }
  };

  const handleImageError = () => {
    setLazyLoading(false);
    setIsImageError(true);
  };

  const columns = [
    {
      field: "filename",
      headerName: "Name",
      width: 800,
      sortable: false,
      renderCell: (params: any) => {
        return (
          <Box sx={{ display: "flex" }}>
            <CardMedia
              component="img"
              ref={imageEl}
              onLoad={handleImageLoad}
              onError={handleImageError}
              data-src={params.row.thumbnail}
              // image={isImageError ? fileBroken : params.row.thumbnail}
              image={params.row.thumbnail}
              loading="lazy"
              sx={{
                objectFit: "fill",
                width: "52px",
                height: "52px",
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", ml: 3 }}>
              <Typography variant="body2">{params.row.filename}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 100,
      sortable: false,
      renderCell: (params: any) => {
        return (
          <Chip
            label={fileExtension(params.row.filename)}
            sx={{
              textTransform: "uppercase",
              backgroundColor: `${fileTypeToColor(
                fileExtension(params.row.filename)
              )}.100`,
              color: `${fileTypeToColor(
                fileExtension(params.row.filename)
              )}.600`,
            }}
            size="small"
          />
        );
      },
    },
    {
      field: "action",
      width: 100,
      headerName: "",
      sortable: false,
      renderCell: (params: any) => {
        return <LinkRoundedIcon sx={{ color: "grey.400" }} />;
      },
    },
  ];

  const handleClick = (params: any) => {
    const locationParams = new URLSearchParams(location.search);
    locationParams.set("fileId", params.row.id);
    history.replace({
      pathname: location.pathname,
      search: locationParams.toString(),
    });
  };

  return (
    <Box sx={{ height: "calc(100vh - 289px)", mt: 2 }}>
      {files && (
        <DataGridPro
          columns={columns}
          rows={files}
          rowHeight={52}
          hideFooter
          disableColumnFilter
          disableColumnMenu
          onRowClick={handleClick}
        />
      )}
    </Box>
  );
};
