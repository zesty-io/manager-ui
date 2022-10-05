import { FC, useState } from "react";
import { Modal, Box, Card, CardMedia } from "@mui/material";
import { FileModalHeader } from "./FileModalHeader";
import { FileModalContent } from "./FileModalContent";
import { FileTypePreview } from "./FileTypePreview";

const styledModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1100,
  bgcolor: "background.paper",
  overflow: "hidden",
  outline: "none",
};

interface Props {
  id?: string;
  src?: string;
  filename?: string;
  title?: string;
  handleCloseModal?: any;
}

export const FileModal: FC<Props> = ({
  id,
  src,
  filename,
  title,
  handleCloseModal,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    handleCloseModal();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          ...styledModal,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
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
          <FileModalHeader filename={filename} />
          <FileModalContent
            id={id}
            src={src}
            filename={filename}
            title={title}
          />
        </Box>
      </Box>
    </Modal>
  );
};
