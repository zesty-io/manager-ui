MediaList;

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
import { File, Bin, Group } from "../../../../../shell/services/types";
import FolderIcon from "@mui/icons-material/Folder";
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
  groups?: Group[];
}

const FilenameColumn = ({ params }: any) => {
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = () => {
    setIsImageError(true);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          height: "52px",
          width: "52px",
          overflow: "hidden",
          backgroundColor: "grey.100",
          position: "relative",
          backgroundSize: `25px 25px`,
          backgroundPosition: `0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px`,
          boxSizing: "border-box",
        }}
      >
        <CardMedia
          component="img"
          onError={handleImageError}
          data-src={params.row.thumbnail}
          image={isImageError ? fileBroken : params.row.thumbnail}
          loading="lazy"
          sx={{
            objectFit: "contain",
            overflow: "hidden",
            height: "100%",
            verticalAlign: "bottom",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", ml: 3 }}>
        <Typography variant="body2">{params.row.name}</Typography>
      </Box>
    </Box>
  );
};

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
};

export const MediaList: FC<Props> = ({ files, groups }) => {
  const imageEl = useRef<HTMLImageElement>();
  const [imageOrientation, setImageOrientation] = useState<string>("");
  const [lazyLoading, setLazyLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [items, setItems] = useState([]);

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const newGroups =
      groups?.map((group) => ({
        ...group,
        name: group.name,
        type: "folder",
      })) || [];
    const newFiles =
      files?.map((file) => ({
        ...file,
        name: file.filename,
        type: fileExtension(file.filename),
      })) || [];
    const test = [...newGroups, ...newFiles];
    console.log("tableItems", test);
    setItems([...newGroups, ...newFiles]);
  }, [files, groups]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <>
            {params.row.filename ? (
              <FilenameColumn params={params} />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "52px" }}>
                  <FolderIcon sx={{ color: "action.active" }} />
                </Box>
                <Typography variant="body2" sx={{ ml: 3 }}>
                  {params.row.name}
                </Typography>
              </Box>
            )}
          </>
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
            {params.row.created_at &&
              moment(params.row.created_at).format("MMMM Do YYYY")}
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
          <>
            <Chip
              label={params.row.type}
              sx={{
                textTransform: "uppercase",
                backgroundColor: `${fileTypeToColor(params.row.type)}.100`,
                color: `${fileTypeToColor(params.row.type)}.600`,
              }}
              size="small"
            />
          </>
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
    <Box component="main" sx={{ height: "100%", width: "100%" }}>
      {files && (
        <DataGridPro
          sx={{
            backgroundColor: "common.white",
            ".MuiDataGrid-row": {
              cursor: "pointer",
            },
            border: "none",
          }}
          columns={columns}
          rows={items}
          rowHeight={52}
          hideFooter
          disableColumnFilter
          disableColumnMenu
          onRowClick={(params: any) => {
            if (params.row.type === "folder") {
              history.replace(`/media/folder/${params.row.id}`);
            } else {
              const locationParams = new URLSearchParams(location.search);
              locationParams.set("fileId", params.row.id);
              history.replace({
                pathname: location.pathname,
                search: locationParams.toString(),
              });
            }
          }}
        />
      )}
    </Box>
  );
};
