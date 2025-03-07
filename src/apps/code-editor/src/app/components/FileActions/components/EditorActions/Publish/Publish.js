import { memo, useState } from "react";

import UploadIcon from "@mui/icons-material/Upload";
import LoadingButton from "@mui/lab/LoadingButton";

import { publishFile, fetchFiles } from "../../../../../../store/files";

import { Tooltip } from "@mui/material";

export const Publish = memo(function Publish(props) {
  const [publishing, setPublishing] = useState(false);

  return (
    <Tooltip title={`Publish Version ${props.version}`}>
      <LoadingButton
        variant="contained"
        color="success"
        size="small"
        onClick={() => {
          setPublishing(true);
          props
            .dispatch(publishFile(props.fileZUID, props.status))
            .finally(() => {
              setPublishing(false);

              props.dispatch(fetchFiles("views"));
              props.dispatch(fetchFiles("stylesheets"));
              props.dispatch(fetchFiles("scripts"));
            });
        }}
        loading={publishing}
        loadingPosition="start"
        startIcon={<UploadIcon fontSize="small" />}
        sx={{ px: 1 }}
      >
        Publish
      </LoadingButton>
    </Tooltip>
  );
});
