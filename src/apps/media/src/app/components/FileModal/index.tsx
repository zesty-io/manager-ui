import { FC, useEffect, Dispatch, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import {
  Modal,
  Box,
  Card,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileModalContent } from "./FileModalContent";
import { FileTypePreview } from "./FileTypePreview";
import { useGetFileQuery } from "../../../../../../shell/services/mediaManager";
import { OTFEditor } from "./OTFEditor";
import { File } from "../../../../../../shell/services/types";
import { useParams } from "../../../../../../shell/hooks/useParams";

const styledModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1100,
  bgcolor: "background.paper",
  outline: "none",
};

interface Props {
  fileId: string;
  onSetIsFileModalError: Dispatch<boolean>;
  currentFiles: File[];
}

export const FileModal: FC<Props> = ({
  fileId,
  onSetIsFileModalError,
  currentFiles,
}) => {
  const history = useHistory();
  const location = useLocation();
  const { data, isLoading, isError, isFetching } = useGetFileQuery(fileId);
  const [showEdit, setShowEdit] = useState(false);
  const [params, setParams] = useParams();
  const [adjacentFiles, setAdjacentFiles] = useState({
    prevFile: null,
    nextFile: null,
  });

  const [imageSettings, setImageSettings] = useState<any>(null);

  const handleCloseModal = () => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete("fileId");
    history.replace({
      search: queryParams.toString(),
    });
  };

  useEffect(() => {
    if (isError) {
      onSetIsFileModalError(true);
    }
  }, [isError]);

  const currentIndex = currentFiles.findIndex((file) => file.id === fileId);

  const handleArrow = (file: File) => {
    if (file) {
      setParams(file.id, "fileId");
      setShowEdit(false);
    }
  };

  useEffect(() => {
    if (currentIndex !== -1) {
      const nextFile =
        currentIndex < currentFiles.length - 1
          ? currentFiles[currentIndex + 1]
          : undefined;

      const prevFile =
        currentIndex > 0 ? currentFiles[currentIndex - 1] : undefined;

      setAdjacentFiles({ prevFile, nextFile });
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowLeft":
          setAdjacentFiles((adjacentFiles) => {
            if (adjacentFiles.prevFile) {
              setParams(adjacentFiles.prevFile.id, "fileId");
              setShowEdit(false);
            }
            return adjacentFiles;
          });
          break;
        case "ArrowRight":
          setAdjacentFiles((adjacentFiles) => {
            if (adjacentFiles.nextFile) {
              setParams(adjacentFiles.nextFile.id, "fileId");
              setShowEdit(false);
            }
            return adjacentFiles;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {data && !isError && !isFetching ? (
        <Dialog
          open={data.url && !isLoading}
          fullScreen
          maxWidth={false}
          onClose={handleCloseModal}
          PaperProps={{
            sx: {
              mx: 10,
              my: 2.5,
              maxHeight: "fill-available",
              maxWidth: 3000,
              overflow: "hidden",
            },
          }}
        >
          {adjacentFiles.nextFile && (
            <IconButton
              size="large"
              onClick={() => {
                handleArrow(adjacentFiles.nextFile);
              }}
              sx={{
                position: "absolute",
                right: -72,
                top: "50%",
              }}
            >
              <ArrowForwardIosRoundedIcon
                sx={{ color: "common.white", width: 35, height: 35 }}
              />
            </IconButton>
          )}
          {adjacentFiles.prevFile && (
            <Box>
              <IconButton
                size="large"
                onClick={() => {
                  handleArrow(adjacentFiles.prevFile);
                }}
                sx={{
                  position: "absolute",
                  left: -72,
                  top: "50%",
                }}
              >
                <ArrowBackIosRoundedIcon
                  sx={{ color: "common.white", width: 35, height: 35 }}
                />
              </IconButton>
            </Box>
          )}
          <DialogContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 0,
              overflow: "hidden",
            }}
          >
            {/* <WithLoader condition={isLoading}> */}
            <Card
              elevation={0}
              sx={{
                width: "100%",
                overflow: "hidden",
                borderRadius: 0,

                // "@media screen and (max-width: 1440px)": {
                //   width: "1440px",
                // },
              }}
            >
              <FileTypePreview
                src={data.url}
                filename={data.filename}
                imageSettings={imageSettings}
              />
            </Card>

            <Box sx={{ minWidth: "420px", maxWidth: "420px" }}>
              {showEdit ? (
                <OTFEditor
                  url={data.url}
                  setShowEdit={setShowEdit}
                  imageSettings={imageSettings}
                  setImageSettings={setImageSettings}
                />
              ) : (
                <FileModalContent
                  handleCloseModal={handleCloseModal}
                  id={data.id}
                  src={data.url}
                  filename={data.filename}
                  title={data.title}
                  groupId={data.group_id}
                  createdAt={data.created_at}
                  binId={data.bin_id}
                  setShowEdit={setShowEdit}
                />
              )}
            </Box>
            {/* </WithLoader> */}
          </DialogContent>
        </Dialog>
      ) : isFetching || (!data && !isError) ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              backgroundColor: "transparent",
              boxShadow: "none",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              textAlign: "center",
            },
          }}
        >
          <CircularProgress color="primary" />
        </Dialog>
      ) : (
        <></>
      )}
    </>
  );
};
