import { FC, useState } from "react";
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
  id?: string;
  src?: string;
  filename?: string;
  title?: string;
  groupId?: string;
  handleCloseModal?: any;
}

export const FileModal: FC<Props> = ({
  id,
  src,
  filename,
  groupId,
  title,
  handleCloseModal,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    handleCloseModal();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <>
        {/* <Box 
          sx={{
            position: "absolute",
            top: "16%",
            left: "52%",
            transform: "translate(-50%, -50%)",
            width: 1100,
            overflow: "hidden",
            outline: "none",
          }}
        >
          <IconButton onClick={() => handleCloseModal()} sx={{ float: "right" }}>
            <CloseRoundedIcon sx={{ color: "#FFF" }} />
          </IconButton>
        </Box> */}
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
              }}
            >
              <FileTypePreview src={src} filename={filename} />
            </Box>
          </Card>

          <Box sx={{ p: 4, width: "400px" }}>
            <FileModalContent
              id={id}
              src={src}
              filename={filename}
              title={title}
              groupId={groupId}
              handleCloseModal={handleCloseModal}
            />
          </Box>
        </Box>
      </>
    </Modal>
  );
};
