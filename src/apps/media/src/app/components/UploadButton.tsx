import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import { fileUploadStage } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import {
  useGetBinQuery,
  useGetGroupDataQuery,
} from "../../../../../shell/services/mediaManager";
import { useParams } from "../../../../../shell/hooks/useParams";
import { useHistory } from "react-router";
import { IconButton } from "@zesty-io/material";

export type UploadButton = {
  currentGroupId?: string;
  currentBinId: string;
  text?: string;
  variant?: "text" | "outlined" | "contained";
  isIconButton?: boolean;
  id?: string;
};

export const UploadButton: FC<UploadButton> = ({
  currentBinId,
  currentGroupId,
  text,
  variant = "contained",
  isIconButton = false,
  id = "fileUploadButton",
}) => {
  const [filesToUpload, setFilesToUpload] = useState<FileList>(null);
  const dispatch = useDispatch();
  const hiddenFileInput = useRef(null);
  const history = useHistory();
  const [params] = useParams();
  const triggerUpload = (params as URLSearchParams).get("triggerUpload");
  const { data: currentGroup, isFetching: groupIsFetching } =
    useGetGroupDataQuery(currentGroupId, {
      skip: !currentGroupId || currentGroupId === currentBinId,
    });
  const { data: binData, isFetching: binIsFetching } = useGetBinQuery(
    currentBinId,
    { skip: !currentBinId }
  );
  const loading = binIsFetching || groupIsFetching;

  useEffect(() => {
    if (triggerUpload) {
      const { from }: { from?: string } = history.location.state;

      handleUploadButtonClick();

      if (!!from) {
        history.replace(from === "/launchpad" ? "/media" : from);
      }
    }
  }, [triggerUpload]);

  useEffect(() => {
    // Makes sure that the file is uploaded to the correct folder by waiting for the ids to be loaded first
    if (filesToUpload?.length && !loading) {
      const currentBin = binData[0];

      dispatch(
        fileUploadStage(
          Array.from(filesToUpload).map((file) => {
            return {
              file,
              bin_id: currentBin.id,
              group_id: currentGroup?.id || currentBin.id,
            };
          })
        )
      );

      setFilesToUpload(null);
    }
  }, [filesToUpload, loading]);

  const handleUploadButtonClick = () => {
    //clears any previous file input value to allow for the same file to be uploaded again
    setFilesToUpload(null);
    hiddenFileInput.current.value = "";
    hiddenFileInput.current.click();
  };

  return (
    <>
      {isIconButton ? (
        <IconButton
          variant="contained"
          size="xsmall"
          onClick={handleUploadButtonClick}
          disabled={loading || !binData}
        >
          <FileUploadRoundedIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button
          data-cy={id}
          onClick={handleUploadButtonClick}
          variant={variant}
          color="primary"
          size="small"
          startIcon={<FileUploadRoundedIcon />}
          disabled={loading || !binData}
        >
          {text || "Upload"}
        </Button>
      )}

      <input
        type="file"
        multiple
        ref={hiddenFileInput}
        onChange={(evt: ChangeEvent<HTMLInputElement>) =>
          setFilesToUpload(evt.target.files)
        }
        hidden
        style={{ display: "none" }}
      />
    </>
  );
};
