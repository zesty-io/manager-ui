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
  toggleFileModal: boolean;
}

export const FileModal: FC<Props> = ({ files, toggleFileModal }) => {
  // const [open, setOpen] = useState(true);
  const search = useLocation().search;
  const fileIdParams = new URLSearchParams(search).get("file_id");
  const currentFile = useRef<any>();
  const [showFileModal, setShowFileModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (!fileIdParams) throw 400;
      if (files.length) {
        files.forEach((file: any) => {
          if (file.id == fileIdParams) {
            currentFile.current = {
              id: file.id,
              src: file.url,
              filename: file.filename,
              groupId: file.group_id,
              createdAt: file.created_at,
              user: file.created_by,
            };
            setShowFileModal(true);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [files, fileIdParams, toggleFileModal]);

  const handleCloseModal = () => {
    currentFile.current.id = "";
    setShowFileModal(!showFileModal);
  };

  const handleClose = () => {
    // setOpen(false);
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
                  onClick={() => handleCloseModal()}
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
