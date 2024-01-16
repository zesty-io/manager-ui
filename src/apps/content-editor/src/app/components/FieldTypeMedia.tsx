import {
  ElementType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Stack,
  Typography,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import fileBroken from "../../../../../../public/images/fileBroken.jpg";
import {
  AttachmentRounded,
  DragIndicatorRounded,
  EditRounded,
  MoreHorizRounded,
  UploadRounded,
  AddRounded,
  DriveFileRenameOutlineRounded,
  WidgetsRounded,
  CheckRounded,
  LinkRounded,
  CloseRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import {
  useGetBinsQuery,
  useGetFileQuery,
  useUpdateFileMutation,
} from "../../../../../shell/services/mediaManager";
import { fileUploadStage } from "../../../../../shell/store/media-revamp";
import { useDropzone } from "react-dropzone";
import { IconButton, ImageSync, theme } from "@zesty-io/material";
import { FileModal } from "../../../../media/src/app/components/FileModal";
import RenameFileModal from "../../../../media/src/app/components/FileModal/RenameFileModal";
import { fileExtension } from "../../../../media/src/app/utils/fileUtils";
import styles from "../../../../media/src/app/components/Thumbnail/Loading.less";
import cx from "classnames";

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
import fontDownloadIcon from "../../../../../../public/images/fontDownloadIcon.svg";

type FieldTypeMediaProps = {
  imageZUIDs: string[];
  limit: number;
  openMediaBrowser: (opts: any) => void;
  name: string;
  onChange: (value: string, name: string) => void;
  hasError?: boolean;
  hideDrag?: boolean;
  lockedToGroupId: string | null;
};

export const FieldTypeMedia = ({
  imageZUIDs,
  limit,
  openMediaBrowser,
  onChange,
  name,
  hasError,
  hideDrag,
  lockedToGroupId,
}: FieldTypeMediaProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [localImageZUIDs, setLocalImageZUIDs] = useState<string[]>(imageZUIDs);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const defaultBin = bins?.find((bin) => bin.default);
  const dispatch = useDispatch();
  const [showFileModal, setShowFileModal] = useState("");
  const [imageToReplace, setImageToReplace] = useState("");

  useEffect(() => {
    setLocalImageZUIDs(imageZUIDs);
  }, [imageZUIDs]);

  const addImage = (images: any[]) => {
    const newImageZUIDs = images.map((image) => image.id);

    // remove any duplicates
    const filteredImageZUIDs = newImageZUIDs.filter(
      (zuid) => !imageZUIDs.includes(zuid)
    );

    onChange([...imageZUIDs, ...filteredImageZUIDs].join(","), name);
  };

  const removeImage = (imageZUID: string) => {
    const newImageZUIDs = imageZUIDs.filter((zuid) => zuid !== imageZUID);
    onChange(newImageZUIDs.join(","), name);
  };

  const replaceImage = (images: any[]) => {
    const imageZUID = images.map((image) => image.id)?.[0];
    let imageToReplace: string;
    setImageToReplace((value: string) => {
      imageToReplace = value;
      return "";
    });

    // if selected replacement image is already in the list of images, do nothing
    if (imageZUIDs.includes(imageZUID)) return;

    const newImageZUIDs = imageZUIDs.map((zuid) => {
      if (zuid === imageToReplace) {
        return imageZUID;
      }
      return zuid;
    });
    onChange(newImageZUIDs.join(","), name);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!defaultBin) return;

      openMediaBrowser({
        limit,
        callback: addImage,
      });

      dispatch(
        fileUploadStage(
          acceptedFiles.map((file) => {
            return {
              file,
              bin_id: defaultBin.id,
              group_id: lockedToGroupId ? lockedToGroupId : defaultBin.id,
            };
          })
        )
      );
    },
    [defaultBin, dispatch, addImage]
  );

  const handleReorder = () => {
    const newLocalImages = [...localImageZUIDs];
    const draggedField = newLocalImages[draggedIndex];
    newLocalImages.splice(draggedIndex, 1);
    newLocalImages.splice(hoveredIndex, 0, draggedField);

    setDraggedIndex(null);
    setHoveredIndex(null);
    setLocalImageZUIDs(newLocalImages);
    onChange(newLocalImages.join(","), name);
  };

  const sortedImages = useMemo(() => {
    if (draggedIndex === null || hoveredIndex === null) {
      return localImageZUIDs;
    } else {
      const newImages = [...localImageZUIDs];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(hoveredIndex, 0, draggedImage);
      return newImages;
    }
  }, [draggedIndex, hoveredIndex, localImageZUIDs]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
  });

  if (!imageZUIDs.length)
    return (
      <div
        {...getRootProps({
          onClick: (evt) => evt.stopPropagation(),
          onKeyDown: (evt) => evt.stopPropagation(),
        })}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            border: (theme) => `1px dashed ${theme.palette.primary.main}`,
            borderRadius: "8px",
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderColor: hasError ? "error.main" : "primary.main",
          }}
        >
          <Stack
            alignItems="center"
            gap={2}
            py={4}
            justifyContent="center"
            height="154px"
          >
            {isDragActive ? (
              <UploadRounded color="primary" />
            ) : (
              <AttachmentRounded color="primary" />
            )}
            <Typography
              align="center"
              variant="h5"
              color="primary"
              fontWeight={600}
            >
              {isDragActive ? (
                "Drop your files here to Upload"
              ) : (
                <>
                  Drag and drop your files here <br /> or
                </>
              )}
            </Typography>
            {!isDragActive && (
              <Box display="flex" gap={1} width="100%" justifyContent="center">
                <Button
                  size="large"
                  variant="outlined"
                  onClick={open}
                  startIcon={<UploadRounded />}
                  fullWidth
                  sx={{
                    maxWidth: "196px",
                  }}
                >
                  Upload
                </Button>
                <Button
                  data-cy="selectFromMediaButton"
                  fullWidth
                  size="large"
                  startIcon={<AddRounded />}
                  variant="outlined"
                  onClick={() => {
                    openMediaBrowser({
                      limit,
                      callback: addImage,
                    });
                  }}
                  sx={{
                    maxWidth: "196px",
                  }}
                >
                  Add from Media
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </div>
    );

  return (
    <>
      <Stack
        gap={1}
        sx={{
          border: (theme) =>
            hasError ? `1px solid ${theme.palette.error.main}` : "none",
        }}
      >
        {sortedImages.map((imageZUID, index) => {
          return (
            <MediaItem
              key={imageZUID}
              imageZUID={imageZUID}
              index={index}
              setDraggedIndex={setDraggedIndex}
              setHoveredIndex={setHoveredIndex}
              onReorder={handleReorder}
              onPreview={(imageZUID: string) => setShowFileModal(imageZUID)}
              onRemove={removeImage}
              onReplace={(imageZUID) => {
                setImageToReplace(imageZUID);
                openMediaBrowser({
                  callback: replaceImage,
                  isReplace: true,
                });
              }}
              hideDrag={hideDrag || limit === 1}
            />
          );
        })}
        {limit > imageZUIDs.length && (
          <Box display="flex" gap={1}>
            <Button
              size="large"
              variant="outlined"
              onClick={open}
              fullWidth
              startIcon={<UploadRounded />}
            >
              Upload More
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => {
                openMediaBrowser({
                  limit,
                  callback: addImage,
                });
              }}
              fullWidth
              startIcon={<AddRounded />}
            >
              Add More from Media
            </Button>
          </Box>
        )}
      </Stack>
      {showFileModal && (
        <FileModal
          fileId={showFileModal}
          onClose={() => setShowFileModal("")}
          currentFiles={sortedImages}
          onFileChange={(fileId) => {
            setShowFileModal(fileId);
          }}
        />
      )}
    </>
  );
};

type MediaItemProps = {
  imageZUID: string;
  onReorder?: () => void;
  setDraggedIndex?: (index: number) => void;
  setHoveredIndex?: (index: number) => void;
  index: number;
  onPreview: (imageZUID: string) => void;
  onRemove: (imageZUID: string) => void;
  onReplace: (imageZUID: string) => void;
  hideDrag?: boolean;
};

const MediaItem = ({
  imageZUID,
  onReorder,
  setDraggedIndex,
  setHoveredIndex,
  index,
  onPreview,
  onRemove,
  onReplace,
  hideDrag,
}: MediaItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data, isFetching } = useGetFileQuery(imageZUID);
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedZuid, setIsCopiedZuid] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [lazyLoading, setLazyLoading] = useState(true);
  const imageEl = useRef<any>(null);
  const [isImageError, setIsImageError] = useState(false);
  const [
    updateFile,
    {
      reset: resetUpdate,
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
    },
  ] = useUpdateFileMutation();

  useEffect(() => {
    if (data?.filename) {
      setNewFilename(
        data.filename.substring(0, data.filename.lastIndexOf("."))
      );
    }
  }, [data]);

  const handleCopyClick = (data: string, isZuid = false) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        if (isZuid) {
          setIsCopiedZuid(true);
        } else {
          setIsCopied(true);
        }
        setTimeout(() => {
          if (isZuid) {
            setIsCopiedZuid(false);
          } else {
            setIsCopied(false);
          }
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const isURL = imageZUID.substr(0, 4) === "http";

  const generateThumbnailData = () => {
    const imageDefaultStyles = {
      width: 80,
      height: 80,
    };
    const iconDefaultStyles = {
      height: 40,
      width: 40,
      padding: 2.5,
    };
    let thumbnailData = {
      src: "",
      sx: {},
      component: "img",
    };

    if (isURL) {
      thumbnailData.src = imageZUID;
      thumbnailData.sx = imageDefaultStyles;
      return thumbnailData;
    }

    switch (fileExtension(data?.filename)) {
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
      case "png":
      case "svg":
      case "ico":
        thumbnailData.src = `${data?.url}?width=80&height=80&fit=bounds`;
        thumbnailData.sx = imageDefaultStyles;
        break;

      case "ots":
      case "xls":
      case "xlsx":
        thumbnailData.src = excelImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "csv":
        thumbnailData.src = csvImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "docx":
      case "doc":
      case "rtf":
        thumbnailData.src = wordImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "pdf":
        thumbnailData.src = pdfImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "ppt":
      case "pptx":
      case "pptm":
        thumbnailData.src = pptImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "aac":
      case "aiff":
      case "mid":
      case "mp3":
      case "wav":
        thumbnailData.src = mpImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

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
        thumbnailData.src = data?.url;
        thumbnailData.sx = imageDefaultStyles;
        thumbnailData.component = "video";
        break;

      case "iso":
      case "rar":
      case "tgz":
      case "zip":
        thumbnailData.src = zipImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "ai":
      case "bmp":
      case "eps":
      case "psd":
      case "tiff":
      case "tif":
        thumbnailData.src = defaultImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "numbers":
        thumbnailData.src = numberImg;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "js":
        thumbnailData.src = jsIcon;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "css":
        thumbnailData.src = cssIcon;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "html":
        thumbnailData.src = htmlIcon;
        thumbnailData.sx = iconDefaultStyles;
        break;

      case "otf":
      case "ttf":
      case "woff":
      case "woff2":
        thumbnailData.src = fontDownloadIcon;
        thumbnailData.sx = iconDefaultStyles;
        break;

      default:
        thumbnailData.src = defaultImg;
        thumbnailData.sx = iconDefaultStyles;
        break;
    }

    return thumbnailData;
  };

  // TODO: Modify this to show icons if the file is not an image
  const imageSrc = isURL
    ? imageZUID
    : `${data?.url}?width=80&height=80&fit=bounds`;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    setDraggedIndex(index);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onReorder();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    setHoveredIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpdateMutation = (renamedFilename?: string) => {
    let constructedFileType = "";
    if (fileExtension(data.filename))
      constructedFileType = `.${fileExtension(data.filename)}`;

    updateFile({
      id: data.id,
      previousGroupId: data.group_id,
      body: {
        group_id: data.group_id,
        filename: `${renamedFilename}${constructedFileType}`,
      },
    });
  };

  const handleImageLoad = () => {
    setLazyLoading(false);
  };

  const handleImageError = () => {
    setLazyLoading(false);
    setIsImageError(true);
  };

  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns={
          hideDrag ? "min-content 1fr" : "repeat(2, min-content) 1fr"
        }
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnter={handleDragEnter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onClick={() => !isURL && onPreview(imageZUID)}
        alignItems="center"
        sx={{
          border: (theme) => `1px solid ${theme.palette.border}`,
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "action.hover",
            cursor: "pointer",
          },
          backgroundColor: "background.paper",
          ...(isDragging && {
            opacity: 0.01,
          }),
        }}
      >
        {!hideDrag && (
          <IconButton
            disableRipple
            size="small"
            sx={{
              cursor: "grab",
            }}
            onMouseEnter={() => setIsDraggable(true)}
            onMouseLeave={() => setIsDraggable(false)}
            onClick={(event: any) => event.stopPropagation()}
          >
            <DragIndicatorRounded fontSize="small" />
          </IconButton>
        )}
        <Box position="relative" width="80px" height="80px" bgcolor="grey.100">
          {!isFetching ? (
            <Box
              component={generateThumbnailData()?.component as ElementType<any>}
              src={generateThumbnailData()?.src}
              sx={{
                objectFit: "contain",
                ...generateThumbnailData()?.sx,
              }}
              ref={imageEl}
              onLoad={handleImageLoad}
              onLoadedData={handleImageLoad}
              onError={handleImageError}
              draggable={false}
            />
          ) : (
            <Box width="80px" height="80px"></Box>
          )}
          {lazyLoading ? (
            <div className={cx(styles.Load, styles.Loading)}></div>
          ) : null}
        </Box>
        <Box
          display="grid"
          // TODO: should there be a min width for the label?
          gridTemplateColumns="minmax(0px, auto) 112px"
          alignItems="center"
          px={2}
          py={2.25}
          gap={2}
          width="100%"
          justifyContent={"space-between"}
          boxSizing="border-box"
        >
          {isURL ? (
            <Typography variant="body2" color="text.primary" noWrap>
              {imageZUID}
            </Typography>
          ) : (
            <Box>
              <Typography
                variant="body2"
                color="text.primary"
                fontWeight={600}
                noWrap
              >
                {data?.filename}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {data?.title}
              </Typography>
            </Box>
          )}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Tooltip title="Replace File" placement="bottom" enterDelay={800}>
              <IconButton
                size="small"
                onClick={(event: any) => {
                  event.stopPropagation();
                  onReplace(imageZUID);
                }}
              >
                <ImageSync fontSize="small" />
              </IconButton>
            </Tooltip>
            {!isURL && (
              <Tooltip title="Edit File" placement="bottom" enterDelay={800}>
                <IconButton size="small">
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="More Options" placement="bottom" enterDelay={800}>
              <IconButton
                size="small"
                onClick={(event: any) => {
                  event.stopPropagation();
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MoreHorizRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={(event: any) => {
                event.stopPropagation();
                setAnchorEl(null);
              }}
              PaperProps={{
                style: {
                  width: "288px",
                },
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {!isURL && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    setAnchorEl(null);
                    setShowRenameFileModal(true);
                  }}
                >
                  <ListItemIcon>
                    <DriveFileRenameOutlineRounded />
                  </ListItemIcon>
                  <ListItemText>Rename</ListItemText>
                </MenuItem>
              )}
              {!isURL && (
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyClick(imageZUID, true);
                  }}
                >
                  <ListItemIcon>
                    {isCopiedZuid ? <CheckRounded /> : <WidgetsRounded />}
                  </ListItemIcon>
                  <ListItemText>Copy ZUID</ListItemText>
                </MenuItem>
              )}
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  handleCopyClick(isURL ? imageZUID : data?.url, false);
                }}
              >
                <ListItemIcon>
                  {isCopied ? <CheckRounded /> : <LinkRounded />}
                </ListItemIcon>
                <ListItemText>Copy File Url</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setAnchorEl(null);
                  onRemove(imageZUID);
                }}
              >
                <ListItemIcon>
                  <CloseRounded />
                </ListItemIcon>
                <ListItemText>Remove</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
      {showRenameFileModal && (
        <RenameFileModal
          src={data.url}
          handleUpdateMutation={handleUpdateMutation}
          onSetNewFilename={setNewFilename}
          onClose={() => setShowRenameFileModal(false)}
          newFilename={newFilename}
          isSuccessUpdate={isSuccessUpdate}
          isLoadingUpdate={isLoadingUpdate}
          resetUpdate={resetUpdate}
          extension={fileExtension(data.filename)}
        />
      )}
    </>
  );
};
