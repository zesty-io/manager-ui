import { FC, useState } from "react";
import { Modal, Box, Card, CardMedia } from "@mui/material";
import { FileModalHeader } from "./FileModalHeader";
import { FileModalContent } from "./FileModalContent";

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
  altText?: string;
  onEdit?: boolean;
  onCloseModal?: () => void;
}

export const FileModal: FC<Props> = ({
  id,
  src,
  filename,
  altText,
  onEdit,
  onCloseModal,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <Modal
      open={open}
      onClose={onCloseModal}
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
            }}
          >
            <CardMedia
              component="img"
              data-src={src}
              image={src}
              loading="lazy"
              sx={{
                objectFit: "contain",
                overflow: "hidden",
                height: "100%",
                m: "auto",
              }}
            />
          </Box>
        </Card>

        <Box sx={{ p: 4, width: "400px" }}>
          <FileModalHeader filename={filename} />
          <FileModalContent
            id={id}
            src={src}
            filename={filename}
            altText={altText}
            onEdit={onEdit}
          />
        </Box>
      </Box>
    </Modal>
  );
};
