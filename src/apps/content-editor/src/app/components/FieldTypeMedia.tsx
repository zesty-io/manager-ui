import { useCallback, useEffect, useMemo, useState } from "react";
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
import { CompactView, Modal, Login } from "@bynder/compact-view";
import { Bynder, FileReplace } from "@zesty-io/material";

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
import { FileTypePreview } from "../../../../media/src/app/components/FileModal/FileTypePreview";
import { useGetInstanceSettingsQuery } from "../../../../../shell/services/instance";
import { ReplaceFileModal } from "../../../../media/src/app/components/FileModal/ReplaceFileModal";
import { showReportDialog } from "@sentry/react";

type FieldTypeMediaProps = {
  images: string[];
  limit: number;
  openMediaBrowser: (opts: any) => void;
  name: string;
  onChange: (value: string, name: string) => void;
  hasError?: boolean;
  hideDrag?: boolean;
  lockedToGroupId: string | null;
};

export const FieldTypeMedia = ({
  images,
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
  const [localImageZUIDs, setLocalImageZUIDs] = useState<string[]>(images);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const defaultBin = bins?.find((bin) => bin.default);
  const dispatch = useDispatch();
  const [showFileModal, setShowFileModal] = useState("");
  const [imageToReplace, setImageToReplace] = useState("");
  const [isBynderOpen, setIsBynderOpen] = useState(false);
  const { data: rawInstanceSettings } = useGetInstanceSettingsQuery();

  const bynderPortalUrlSetting = rawInstanceSettings?.find(
    (setting) => setting.key === "bynder_portal_url"
  );
  const bynderTokenSetting = rawInstanceSettings?.find(
    (setting) => setting.key === "bynder_token"
  );
  // Checks if the bynder portal and token are set
  const isBynderSessionValid =
    localStorage.getItem("cvrt") && localStorage.getItem("cvad");

  useEffect(() => {
    setLocalImageZUIDs(images);
  }, [images]);

  useEffect(() => {
    if (bynderPortalUrlSetting?.value) {
      localStorage.setItem("cvad", bynderPortalUrlSetting.value);
    } else {
      localStorage.removeItem("cvad");
    }
  }, [bynderPortalUrlSetting]);

  useEffect(() => {
    if (bynderTokenSetting?.value) {
      localStorage.setItem("cvrt", bynderTokenSetting.value);
    } else {
      localStorage.removeItem("cvrt");
    }
  }, [bynderTokenSetting]);

  const addZestyImage = (selectedImages: any[]) => {
    const newImageZUIDs = selectedImages.map((image) => image.id);
    // remove any duplicates
    const filteredImageZUIDs = newImageZUIDs.filter(
      (zuid) => !images.includes(zuid)
    );

    onChange([...images, ...filteredImageZUIDs].join(","), name);
  };

  const addBynderAsset = (selectedAsset: any[]) => {
    if (images.length > limit) return;

    const newBynderAssets = selectedAsset
      .slice(0, limit - images.length)
      .map((asset) => asset.originalUrl);
    const filteredBynderAssets = newBynderAssets.filter(
      (asset) => !images.includes(asset)
    );

    onChange([...images, ...filteredBynderAssets].join(","), name);
  };

  const removeImage = (imageId: string) => {
    const newImageZUIDs = images.filter((image) => image !== imageId);

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
    if (localImageZUIDs.includes(imageZUID)) return;
    const newImageZUIDs = localImageZUIDs.map((zuid) => {
      if (zuid === imageToReplace) {
        return imageZUID;
      }

      return zuid;
    });
    onChange(newImageZUIDs.join(","), name);
  };

  const replaceBynderAsset = (selectedAsset: any) => {
    // Prevent adding bynder asset that has already been added
    if (localImageZUIDs.includes(selectedAsset.originalUrl)) return;

    const newImages = localImageZUIDs.map((image) => {
      if (image === imageToReplace) {
        return selectedAsset.originalUrl;
      }

      return image;
    });

    setImageToReplace("");
    onChange(newImages.join(","), name);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!defaultBin) return;

      openMediaBrowser({
        limit,
        callback: addZestyImage,
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
    [defaultBin, dispatch, addZestyImage]
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

  if (!images?.length)
    return (
      <>
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
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.04),
              borderColor: hasError ? "error.main" : "primary.main",
            }}
          >
            <Stack alignItems="center" gap={2} py={4} justifyContent="center">
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
                <Box
                  display="flex"
                  gap={1}
                  width={400}
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={open}
                    startIcon={<UploadRounded />}
                    fullWidth
                    sx={{
                      maxWidth: "196px",
                      flexShrink: 0,
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
                        callback: addZestyImage,
                      });
                    }}
                    sx={{
                      maxWidth: "196px",
                      flexShrink: 0,
                    }}
                  >
                    Add from Media
                  </Button>
                  {isBynderSessionValid && (
                    <Button
                      data-cy="addFromBynderBtn"
                      size="large"
                      variant="outlined"
                      onClick={() => setIsBynderOpen(true)}
                      startIcon={<Bynder />}
                      fullWidth
                      sx={{
                        maxWidth: "240px",
                        flexShrink: 0,
                      }}
                    >
                      Add from Bynder
                    </Button>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </div>
        <Modal isOpen={isBynderOpen} onClose={() => setIsBynderOpen(false)}>
          <Login>
            <CompactView
              onSuccess={(assets) => {
                if (assets?.length) {
                  addBynderAsset(assets);
                  setIsBynderOpen(false);
                }
              }}
            />
          </Login>
        </Modal>
      </>
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
        {sortedImages.map((image, index) => {
          const isBynderAsset = image.includes("bynder.com");

          return (
            <MediaItem
              key={image}
              imageZUID={image}
              index={index}
              setDraggedIndex={setDraggedIndex}
              setHoveredIndex={setHoveredIndex}
              onReorder={handleReorder}
              onPreview={(imageZUID: string) => setShowFileModal(imageZUID)}
              onRemove={removeImage}
              onReplace={(imageZUID) => {
                setImageToReplace(imageZUID);

                if (isBynderAsset) {
                  setIsBynderOpen(true);
                } else {
                  openMediaBrowser({
                    callback: replaceImage,
                    isReplace: true,
                  });
                }
              }}
              hideDrag={hideDrag || limit === 1}
              isBynderAsset={isBynderAsset}
              isBynderSessionValid={!!isBynderSessionValid}
            />
          );
        })}
        {limit > images.length && (
          <Box display="flex" gap={1}>
            {!isBynderSessionValid && (
              <Button
                size="large"
                variant="outlined"
                onClick={open}
                startIcon={<UploadRounded />}
                fullWidth
              >
                Upload
              </Button>
            )}
            <Button
              size="large"
              variant="outlined"
              onClick={() => {
                openMediaBrowser({
                  limit,
                  callback: addZestyImage,
                });
              }}
              fullWidth
              startIcon={<AddRounded />}
            >
              Add More from Media
            </Button>
            {isBynderSessionValid && (
              <Button
                data-cy="addFromBynderBtn"
                size="large"
                variant="outlined"
                onClick={() => setIsBynderOpen(true)}
                startIcon={<Bynder />}
                fullWidth
              >
                Add from Bynder
              </Button>
            )}
          </Box>
        )}
      </Stack>
      {showFileModal && (
        <FileModal
          fileId={showFileModal}
          onClose={() => setShowFileModal("")}
          currentFiles={
            sortedImages?.filter(
              (image) => typeof image === "string"
            ) as string[]
          }
          onFileChange={(fileId) => {
            setShowFileModal(fileId);
          }}
        />
      )}
      <Modal isOpen={isBynderOpen} onClose={() => setIsBynderOpen(false)}>
        <Login>
          <CompactView
            onSuccess={(assets) => {
              if (assets?.length) {
                if (imageToReplace) {
                  replaceBynderAsset(assets[0]);
                } else {
                  addBynderAsset(assets);
                }

                setIsBynderOpen(false);
              }
            }}
          />
        </Login>
      </Modal>
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
  isBynderAsset: boolean;
  isBynderSessionValid: boolean;
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
  isBynderAsset,
  isBynderSessionValid,
}: MediaItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data, isFetching } = useGetFileQuery(imageZUID, {
    skip: imageZUID?.substr(0, 4) === "http",
  });
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [isReplaceFileModalOpen, setIsReplaceFileModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedZuid, setIsCopiedZuid] = useState(false);
  const [newFilename, setNewFilename] = useState("");
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

  return (
    <>
      <Box
        data-cy="mediaItem"
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
        onClick={() => {
          if (isURL) return;

          onPreview(imageZUID);
        }}
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
        position="relative"
      >
        {isBynderAsset && (
          <Box
            data-cy="bynderAssetIndicator"
            width={24}
            height={24}
            borderRadius={100}
            position="absolute"
            left={hideDrag ? 52 : 84}
            top={52}
            zIndex={2}
            px={0.25}
            boxSizing="border-box"
            sx={{
              backgroundColor: "#0af",
            }}
          >
            <Bynder
              sx={{
                width: "100%",
                color: "common.white",
              }}
            />
          </Box>
        )}
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
          {isFetching ? (
            <div className={cx(styles.Load, styles.Loading)}></div>
          ) : (
            <FileTypePreview
              src={isURL ? imageZUID : data?.url}
              filename={isURL ? imageZUID : data?.filename}
              updatedAt={data?.updated_at}
              isMediaThumbnail
            />
          )}
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
            {!isBynderAsset || (isBynderAsset && isBynderSessionValid) ? (
              <Tooltip title="Swap File" placement="bottom" enterDelay={800}>
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
            ) : (
              <></>
            )}
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
              {!isURL && !isBynderAsset && (
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
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setAnchorEl(null);
                  setIsReplaceFileModalOpen(true);
                }}
              >
                <ListItemIcon>
                  <FileReplace />
                </ListItemIcon>
                <ListItemText>Replace File</ListItemText>
              </MenuItem>
              {!isURL && !isBynderAsset && (
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
      {isReplaceFileModalOpen && (
        <ReplaceFileModal
          originalFile={data}
          onClose={() => setIsReplaceFileModalOpen(false)}
          onCancel={() => setIsReplaceFileModalOpen(false)}
        />
      )}
    </>
  );
};
