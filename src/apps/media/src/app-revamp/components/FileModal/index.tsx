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
  user?: {
    email?: string;
    role?: string;
  };
  logs?: {
    createdAt?: string;
    timeUploaded?: string;
  };
}

export const FileModal: FC<Props> = ({
  id,
  src,
  filename,
  groupId,
  title,
  handleCloseModal,
  user,
  logs,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    handleCloseModal();
  };

  return (
    <Modal open={open}>
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
            user={user}
            logs={logs}
          />
        </Box>
      </Box>
    </Modal>
  );
};
