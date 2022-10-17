import { FC, useEffect, Dispatch } from "react";
import { useHistory, useLocation } from "react-router-dom";

import {
  Modal,
  Box,
  Card,
  IconButton,
  CircularProgress,
  Dialog,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// import { WithLoader } from "@zesty-io/core";
import { NotFoundState } from "../NotFoundState";

import { FileModalContent } from "./FileModalContent";
import { FileTypePreview } from "./FileTypePreview";

import { useGetFileQuery } from "../../../../../../shell/services/mediaManager";

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
        <Modal open={data.url && !isLoading}>
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
              <CloseIcon sx={{ color: "common.white" }} />
            </IconButton>

            {/* <WithLoader condition={isLoading}> */}
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
                <FileTypePreview src={data.url} filename={data.filename} />
              </Box>
            </Card>

            <Box sx={{ p: 4, width: "400px" }}>
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
            </Box>
            {/* </WithLoader> */}
          </Box>
        </Modal>
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
