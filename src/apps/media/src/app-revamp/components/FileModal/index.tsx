import { FC, useEffect, useState, useRef } from "react";
import {
  Modal,
  Box,
  Card,
  CardMedia,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { FileModalContent } from "./FileModalContent";
import { FileTypePreview } from "./FileTypePreview";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { File } from "../../../../../../shell/services/types";
import { useLocation } from "react-router-dom";
import { useHistory, useRouteMatch } from "react-router-dom";

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
  files: File[];
}

export const FileModal: FC<Props> = ({ files }) => {
  const search = useLocation().search;
  const fileIdParams = new URLSearchParams(search).get("file_id");
  const currentFile = useRef<any>();
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const location = useRouteMatch();
  const history = useHistory();

  useEffect(() => {
    try {
      if (!fileIdParams) throw 400;
      if (files.length) {
        const filteredFile = files.find((file) => file.id === fileIdParams);
        currentFile.current = {
          id: filteredFile.id,
          src: filteredFile.url,
          filename: filteredFile.filename,
          groupId: filteredFile.group_id,
          createdAt: filteredFile.created_at,
          user: filteredFile.created_by,
        };
        setShowFileModal(true);
      }
    } catch (err) {
      console.log(err);
    }
  }, [files, fileIdParams]);

  const handleCloseModal = () => {
    currentFile.current.id = "";
    setShowFileModal(!showFileModal);
  };

  const handleClose = () => {
    history.replace(location.path);
    handleCloseModal();
  };

  return (
    <>
      {currentFile.current && (
        <>
          {currentFile.current.id && showFileModal && (
            <Modal open={true}>
              <Box
                sx={{
                  ...styledModal,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <IconButton
                  onClick={() => handleClose()}
                  sx={{
                    position: "absolute",
                    zIndex: 999,
                    right: -30,
                    top: -35,
                  }}
                >
                  <CloseRoundedIcon sx={{ color: "#FFF" }} />
                </IconButton>
                <Card
                  elevation={0}
                  sx={{
                    width: "700px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "grey.200",
                      height: "100%",
                      overflow: "hidden",
                      width: "100%",
                    }}
                  >
                    <FileTypePreview
                      src={currentFile.current.src}
                      filename={currentFile.current.filename}
                    />
                  </Box>
                </Card>

                <Box sx={{ p: 4, width: "400px" }}>
                  <FileModalContent
                    id={currentFile.current.id}
                    src={currentFile.current.src}
                    filename={currentFile.current.filename}
                    title={currentFile.current.filename}
                    groupId={currentFile.current.groupId}
                    handleCloseModal={handleCloseModal}
                    createdAt={currentFile.current.createdAt}
                  />
                </Box>
              </Box>
            </Modal>
          )}
        </>
      )}
    </>
  );
};
