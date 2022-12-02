import { FC, useState, useMemo, useRef } from "react";
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
  files?: any;
  loading?: boolean;
}

const ActionColumn = ({ params }: any) => {
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
        handleCopyClick(params.row.FullPath);
      }}
    >
      {isCopied ? (
        <CheckIcon sx={{ color: "grey.400" }} />
      ) : (
        <LinkRoundedIcon sx={{ color: "grey.400" }} />
      )}
    </IconButton>
  );
};

const FilenameColumn = ({ params }: any) => {
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = () => {
    setIsImageError(true);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CardMedia
        component="img"
        onError={handleImageError}
        data-src={params.row.thumbnail || params.row.FullPath}
        image={
          isImageError
            ? fileBroken
            : params.row.thumbnail || params.row.FullPath
        }
        loading="lazy"
        sx={{
          objectFit: "fill",
          width: "52px",
          height: "52px",
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", ml: 3 }}>
        <Typography variant="body2">
          {params.row.filename || params.row.FileName.slice(1)}
        </Typography>
      </Box>
    </Box>
  );
};

export const InsightsTable: FC<Props> = ({ files, loading }) => {
  const history = useHistory();
  const columns = [
    {
      field: "filename",
      headerName: "Name",
      sortable: false,
      flex: 1,
      renderCell: (params: any) => <FilenameColumn params={params} />,
    },
    {
      field: "Requests",
      headerName: "Requests",
      width: 140,
      sortable: false,
    },
    {
      field: "ThroughtputGB",
      headerName: "Bandwidth",
      width: 140,
      sortable: false,
      renderCell: (params: any) => {
        return (
          <Typography>
            {numberFormatter.format(params.row.ThroughtputGB)} GB
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
            label={fileExtension(params.row.filename || params.row.FileName)}
            sx={{
              textTransform: "uppercase",
              backgroundColor: `${fileTypeToColor(
                fileExtension(params.row.filename || params.row.FileName)
              )}.100`,
              color: `${fileTypeToColor(
                fileExtension(params.row.filename || params.row.FileName)
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
      renderCell: (params: any) => <ActionColumn params={params} />,
    },
  ];

  return (
    <Box sx={{ height: "calc(100vh - 242px)" }}>
      {files && (
        <DataGridPro
          sx={{ border: "none" }}
          columns={columns}
          rows={files}
          rowHeight={52}
          hideFooter
          disableColumnFilter
          disableColumnMenu
          loading={loading}
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
