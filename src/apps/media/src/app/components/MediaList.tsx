import { FC, useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  CardMedia,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../shell/services/metrics";
import { DataGridPro, GridValueGetterParams } from "@mui/x-data-grid-pro";
import { File, Bin } from "../../../../../shell/services/types";
import fileBroken from "../../../../../../public/images/fileBroken.jpg";
import { useHistory, useLocation } from "react-router-dom";
import { numberFormatter } from "../../../../../utility/numberFormatter";
import moment from "moment";
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
import CheckIcon from "@mui/icons-material/Check";

interface Props {
  files?: File[];
}

export const MediaList: FC<Props> = ({ files }) => {
  const imageEl = useRef<HTMLImageElement>();
  const [imageOrientation, setImageOrientation] = useState<string>("");
  const [lazyLoading, setLazyLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);

  const location = useLocation();
  const history = useHistory();

  const columns = [
    {
      field: "filename",
      headerName: "Name",
      sortable: false,
      flex: 1,
      renderCell: (params: any) => {
        const [isImageError, setIsImageError] = useState(false);

        const handleImageError = () => {
          setIsImageError(true);
        };

        return (
          <Box sx={{ display: "flex" }}>
            <CardMedia
              component="img"
              onError={handleImageError}
              data-src={params.row.thumbnail}
              image={isImageError ? fileBroken : params.row.thumbnail}
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
      field: "created_at",
      headerName: "Added On",
      width: 200,
      sortable: false,
      renderCell: (params: any) => {
        return (
          <Typography>
            {moment(params.row.created_at).format("MMMM Do YYYY")}
          </Typography>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 88,
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
      headerName: "",
      width: 64,
      sortable: false,
      renderCell: (params: any) => {
        const [isCopied, setIsCopied] = useState(false);

        const handleCopyClick = (data: string) => {
          navigator?.clipboard
            ?.writeText(data)
            .then(() => {
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 1500);
            })
            .catch((err) => {
              console.error(err);
            });
        };

        return (
          <IconButton
            onClick={(evt: any) => {
              evt.stopPropagation();
              handleCopyClick(params.row.thumbnail);
            }}
          >
            {isCopied ? (
              <CheckIcon sx={{ color: "grey.400" }} />
            ) : (
              <LinkRoundedIcon sx={{ color: "grey.400" }} />
            )}
          </IconButton>
        );
      },
    },
  ];

  return (
    <Box component="main" sx={{ height: "calc(100vh - 242px)", width: "100%" }}>
      {files && (
        <DataGridPro
          sx={{ border: "none" }}
          columns={columns}
          rows={files}
          rowHeight={52}
          hideFooter
          disableColumnFilter
          disableColumnMenu
          onRowClick={(params: any) => {
            const locationParams = new URLSearchParams(location.search);
            locationParams.set("fileId", params.row.id);
            history.replace({
              pathname: location.pathname,
              search: locationParams.toString(),
            });
          }}
        />
      )}
    </Box>
  );
};
