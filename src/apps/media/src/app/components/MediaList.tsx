import { FC, useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  CardMedia,
  IconButton,
  Tooltip,
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
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import FontDownloadRoundedIcon from "@mui/icons-material/FontDownloadRounded";

// file icons import
import wordImg from "../../../../../../public/images/wordImg.png";
import excelImg from "../../../../../../public/images/excelImg.png";
import pdfImg from "../../../../../../public/images/pdfImg.png";
import pptImg from "../../../../../../public/images/pptImg.png";
import mpImg from "../../../../../../public/images/mpImg.png";
import csvImg from "../../../../../../public/images/csvImg.png";
import zipImg from "../../../../../../public/images/zipImg.png";
import numberImg from "../../../../../../public/images/numberImg.png";
import defaultImg from "../../../../../../public/images/defaultImg.png";
import jsIcon from "../../../../../../public/images/jsIcon.svg";
import htmlIcon from "../../../../../../public/images/htmlIcon.svg";
import cssIcon from "../../../../../../public/images/cssIcon.svg";

interface Props {
  files?: File[];
  groups?: Group[];
}

const NameColumn = ({ params }: any) => {
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = () => {
    setIsImageError(true);
  };

  const NameTooltip = () => {
    return (
      <Box sx={{ display: "flex", alignItems: "center", ml: 3 }}>
        <Tooltip title={params.row.name}>
          <Typography variant="body2">{params.row.name}</Typography>
        </Tooltip>
      </Box>
    );
  };

  switch (fileExtension(params.row.name)) {
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "png":
    case "svg":
    case "ico":
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
          <NameTooltip />
        </Box>
      );
    case "ots":
    case "xls":
    case "xlsx":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "green.100",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={excelImg}
              image={excelImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "pdf":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={pdfImg}
              image={pdfImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "csv":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "green.100",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={csvImg}
              image={csvImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "docx":
    case "doc":
    case "rtf":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={wordImg}
              image={wordImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "ppt":
    case "pptx":
    case "pptm":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "red.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={pptImg}
              image={pptImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "aac":
    case "aiff":
    case "mid":
    case "mp3":
    case "wav":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "purple.100",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={mpImg}
              image={mpImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "mp4":
    case "mov":
    case "avi":
    case "wmv":
    case "mkv":
    case "webm":
    case "flv":
    case "f4v":
    case "swf":
    case "avchd":
    case "html5":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "#000",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="video"
              controls={false}
              src={params.row.thumbnail}
              sx={{
                backgroundColor: "#000",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                py: 1,
              }}
            />
            <PlayCircleIcon
              fontSize="small"
              sx={{
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                m: "auto",
                color: "#FFF",
                position: "absolute",
                textAlign: "center",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "iso":
    case "rar":
    case "tgz":
    case "zip":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "grey.100",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={zipImg}
              image={zipImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "ai":
    case "bmp":
    case "eps":
    case "psd":
    case "tiff":
    case "tif":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "grey.100",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={defaultImg}
              image={defaultImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "numbers":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "green.100",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={numberImg}
              image={numberImg}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "js":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={jsIcon}
              image={jsIcon}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "css":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={cssIcon}
              image={cssIcon}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "html":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              data-src={htmlIcon}
              image={htmlIcon}
              loading="lazy"
              sx={{
                m: "auto",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "otf":
    case "ttf":
    case "woff":
    case "woff2":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontDownloadRoundedIcon
              fontSize="small"
              sx={{ color: "grey.600", m: "auto" }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    case "No Extension":
      return (
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              height: "52px",
              width: "52px",
              backgroundColor: "blue.50",
              position: "relative",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ReportGmailerrorredIcon
              fontSize="small"
              sx={{ color: "red.600", m: "auto" }}
            />
          </Box>
          <NameTooltip />
        </Box>
      );
    default:
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
          <NameTooltip />
        </Box>
      );
  }
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
        handleCopyClick(
          params.row.thumbnail ||
            `${window.location.host}/media/folder/${params.row.id}`
        );
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
              <NameColumn params={params} />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "52px" }}>
                  <FolderIcon sx={{ color: "action.active" }} />
                </Box>
                <Tooltip title={params.row.name}>
                  <Typography variant="body2" sx={{ ml: 3 }}>
                    {params.row.name}
                  </Typography>
                </Tooltip>
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
          <Typography variant="body2">
            {params.row.created_at &&
              moment(params.row.created_at).format("MMMM Do YYYY")}
          </Typography>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 104,
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
    <Box component="main" sx={{ height: "100%", width: "100%", px: 4 }}>
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
