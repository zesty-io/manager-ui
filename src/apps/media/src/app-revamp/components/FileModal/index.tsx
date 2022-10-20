import { FC, useEffect, Dispatch, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
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
// import { WithLoader } from "@zesty-io/core";
import { NotFoundState } from "../NotFoundState";

import { FileModalContent } from "./FileModalContent";
import { FileTypePreview } from "./FileTypePreview";

import { useGetFileQuery } from "../../../../../../shell/services/mediaManager";
import { OTFEditor } from "./OTFEditor";

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
}

export const FileModal: FC<Props> = ({ fileId, onSetIsFileModalError }) => {
  const history = useHistory();
  const location = useLocation();
  const { data, isLoading, isError } = useGetFileQuery(fileId);
  const [showEdit, setShowEdit] = useState(false);

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

  return (
    <>
      {data && !isError ? (
        <Dialog
          open={data.url && !isLoading}
          fullWidth
          maxWidth={false}
          onClose={handleCloseModal}
          PaperProps={{
            style: {
              height: "950px",
              maxWidth: "1300px",
            },
          }}
        >
          <Box>
            <IconButton
              onClick={() => handleCloseModal()}
              sx={{
                position: "fixed",
                zIndex: 999,
                right: 5,
                top: 0,
              }}
            >
              <CloseIcon sx={{ color: "common.white" }} />
            </IconButton>
          </Box>
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
                width: "1000px",
                overflow: "hidden",

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
                />
              )}
            </Box>
            {/* </WithLoader> */}
          </DialogContent>
        </Dialog>
      ) : !data && !isError ? (
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
          <CircularProgress color="info" />
        </Dialog>
      ) : (
        <></>
      )}
    </>
  );
};
