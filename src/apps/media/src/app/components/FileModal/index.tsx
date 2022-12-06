import { FC, useEffect, Dispatch, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { File } from "../../../../../../shell/services/types";
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
  files: File[];
}

export const FileModal: FC<Props> = ({
  fileId,
  onSetIsFileModalError,
  files,
}) => {
  const history = useHistory();
  const location = useLocation();
  const { data, isLoading, isError } = useGetFileQuery(fileId);
  const [showEdit, setShowEdit] = useState(false);
  const [params, setParams] = useParams();

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
  const getIds = () => {
    if (files) {
      const fileIndex = files.findIndex((file) => file.id === fileId);
      const next = files[fileIndex + 1];
      const prev = files[fileIndex - 1];
      console.log({
        files,
        fileIndex,
        next,
        prev,
      });
      return { next, prev };
    } else {
      return {
        next: null,
        prev: null,
      };
    }
  };
  const { next, prev } = getIds();

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
              height: "680px",
              maxWidth: "1300px",
            },
          }}
        >
          <Box>
            <IconButton
              onClick={() => handleCloseModal()}
              aria-label="Close Icon"
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
          {next && (
            <Box>
              <IconButton
                onClick={() => {
                  setParams(next.id, "fileId");
                }}
                sx={{
                  position: "fixed",
                  zIndex: 999,
                  right: 50,
                  top: 0,
                }}
              >
                <ArrowForwardIosRoundedIcon sx={{ color: "common.white" }} />
              </IconButton>
            </Box>
          )}
          {prev && (
            <Box>
              <IconButton
                onClick={() => {
                  setParams(prev.id, "fileId");
                }}
                sx={{
                  position: "fixed",
                  zIndex: 999,
                  left: 50,
                  top: 0,
                }}
              >
                <ArrowForwardIosRoundedIcon
                  sx={{ color: "common.white", transform: "scaleX(-1)" }}
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
                  setShowEdit={setShowEdit}
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
          <CircularProgress color="primary" />
        </Dialog>
      ) : (
        <></>
      )}
    </>
  );
};
