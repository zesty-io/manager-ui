import { FC, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import FileUpload from "@mui/icons-material/FileUpload";
import { fileUploadStage } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import { ChangeEventHandler } from "react";
import {
  useGetBinQuery,
  useGetGroupDataQuery,
} from "../../../../../shell/services/mediaManager";
import { useParams } from "../../../../../shell/hooks/useParams";
import { useHistory } from "react-router";

export type UploadButton = {
  currentGroupId?: string;
  currentBinId: string;
  text?: string;
  variant?: "text" | "outlined" | "contained";
};

export const UploadButton: FC<UploadButton> = ({
  currentBinId,
  currentGroupId,
  text,
  variant = "contained",
}) => {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef(null);
  const history = useHistory();
  const [params] = useParams();
  const triggerUpload = (params as URLSearchParams).get("triggerUpload");
  const { data: currentGroup, isFetching: groupIsFetching } =
    useGetGroupDataQuery(currentGroupId, { skip: !currentGroupId });
  const { data: binData, isFetching: binIsFetching } = useGetBinQuery(
    currentBinId,
    { skip: !currentBinId }
  );
  const loading = binIsFetching || groupIsFetching;

  useEffect(() => {
    if (triggerUpload) {
      handleUploadButtonClick();
      history.replace("/media");
    }
  }, [triggerUpload]);

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (loading || !binData) return;
    const currentBin = binData[0];

    dispatch(
      fileUploadStage(
        Array.from(event.target.files).map((file) => {
          return {
            file,
            bin_id: currentBin.id,
            group_id: currentGroup?.id || currentBin.id,
          };
        })
      )
    );
  };
  const handleUploadButtonClick = () => {
    //clears any previous file input value to allow for the same file to be uploaded again
    hiddenFileInput.current.value = "";
    hiddenFileInput.current.click();
  };
  return (
    <>
      <Button
        onClick={handleUploadButtonClick}
        variant={variant}
        color="primary"
        size="small"
        startIcon={<FileUpload />}
      >
        {text || "Upload"}
      </Button>
      <input
        type="file"
        multiple
        ref={hiddenFileInput}
        onChange={handleFileInputChange}
        hidden
        style={{ display: "none" }}
      />
    </>
  );
};
