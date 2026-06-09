import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { fileTypeOptions, scripts, stylesheets } from "./constants";
import { notify } from "../../../../../shell/store/notifications";
import { createFile, fetchFiles } from "../../store/files";

export type CreateFileProps = {
  open: boolean;
  onClose: () => void;
  defaultType: string;
  title?: string;
};

const CreateFile = memo(function CreateFile({
  open,
  onClose,
  defaultType,
  title = "Create File",
}: CreateFileProps) {
  const { t } = useTranslation();
  const history = useHistory();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(defaultType || "");
  const [name, setName] = useState("");

  const handleClearForm = () => {
    setType("");
    setName("");
  };

  const handleCreateFile = () => {
    if (!type) {
      dispatch(
        notify({
          kind: "warn",
          message: "You must select a file type to create a new file",
        })
      );
      return;
    }
    if (!name) {
      dispatch(
        notify({
          kind: "warn",
          message: "You must provide a name for the new file",
        })
      );
      return;
    }

    if (type === "ajax-json" && name.charAt(0) !== "/") {
      dispatch(
        notify({
          kind: "warn",
          message: `Please add leading slash in file path EX: /${name}`,
        })
      );
      return;
    }

    setLoading(true);
    let redirectPage = "";
    Promise.resolve(dispatch(createFile(name, type)))
      .then((res: any) => {
        if (!res?.error) {
          history.push(`/code/file/${res.pathPart}/${res.data.ZUID}`);
          handleClearForm();
        }
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };
  useEffect(() => {
    setType(defaultType || "");
    return () => {
      handleClearForm();
    };
  }, [defaultType]);

  return (
    <Dialog
      data-cy="CodeAppCreateFileDialog"
      open={open}
      onClose={() => {
        handleClearForm();
        onClose();
      }}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          p: 0,
          boxSizing: "content-box",
        },
      }}
    >
      <DialogTitle
        borderBottom="1px solid"
        borderColor="border"
        sx={{ textTransform: "capitalize" }}
      >
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            m: 1,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: "20px", bgcolor: "grey.50" }}>
          <Box width="100%">
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              mb="4px"
            >
              File Type
            </Typography>
            <Autocomplete
              data-cy="CreateFileFileTypeInput"
              color="primary"
              disableClearable
              autoHighlight
              size="small"
              value={fileTypeOptions.find((option) => option.value === type)}
              onChange={(event, newValue) => {
                setType(newValue?.value || "");
              }}
              clearOnEscape
              options={fileTypeOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="-- choose a file type --" />
              )}
            />
          </Box>
          {!!type && (
            <Box mt={2}>
              {type === "snippet" && (
                <Typography variant="body2" color="text.secondary">
                  Parsley accessible file meant to abstract common use of code,
                  or for organizing file build. Examples: slider, footer,
                  header. These can be used inside of each loops as well.
                </Typography>
              )}
              {type === "text/css" && (
                <Typography variant="body2" color="text.secondary">
                  A cascading stylesheet that is automatically concatenated into
                  a single css file /main.css which is auto included in the head
                  of webengine web pages. Sort Order of the concatenation can be
                  controlled. No transpiling occurs.
                </Typography>
              )}
              {type === "text/less" && (
                <Typography variant="body2" color="text.secondary">
                  Has access to settings &gt; variables. A cascading stylesheet
                  that is automatically concatenated into a the single
                  /main.css. Sort Order of the concatenation and transpiling can
                  be controlled.
                </Typography>
              )}
              {type === "text/scss" && (
                <Typography variant="body2" color="text.secondary">
                  Has access to settings &gt; variables. A cascading stylesheet
                  that is automatically concatenated into a the single
                  /main.css. Sort Order of the concatenation and transpiling can
                  be controlled.
                </Typography>
              )}
              {type === "text/javascript" && (
                <Typography variant="body2" color="text.secondary">
                  A javascript file that is automatically concatenated into a
                  the single /main.js file that is automatically loaded by
                  webengine. No transpiling occurs.
                </Typography>
              )}
              {type === "ajax-json" && (
                <Typography variant="body2" color="text.secondary">
                  Parsley accessible file for creating endpoints or custom
                  experiences. These files need to be named with a full path
                  with an extension like <strong> /my/file/path.json.</strong>{" "}
                  The file is accessible at
                  hash-dev.preview.zesty.io/my/file/path.json. File types that
                  can be used: css, html, json, js, xml, csv, tsv, xml, yaml,
                  md, svg, rss, ics, vcf, xhtml.
                </Typography>
              )}
            </Box>
          )}

          <Box mt={2} width="100%">
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              mb="4px"
            >
              File Name
            </Typography>
            <TextField
              data-cy="CreateFileFileNameInput"
              name="file_name"
              fullWidth
              value={name}
              onChange={(evt) => setName(evt.target.value)}
              size="small"
              inputProps={{
                maxLength: 100,
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          p: "20px",
          borderTop: "1px solid",
          borderColor: "border",
        }}
      >
        <Button
          data-cy="CreateFileCancelButton"
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          {t("cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          data-cy="CreateFileCreateButton"
          variant="contained"
          color="primary"
          onClick={handleCreateFile}
          disabled={type === "" || type === "0" || !name}
          loading={loading}
        >
          Create File
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CreateFile;
