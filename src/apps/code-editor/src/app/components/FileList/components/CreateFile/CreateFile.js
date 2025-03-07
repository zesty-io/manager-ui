import { memo, Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

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
import AddIcon from "@mui/icons-material/Add";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoadingButton from "@mui/lab/LoadingButton";
import CloseIcon from "@mui/icons-material/Close";
import { FieldTypeText } from "@zesty-io/material";
import { FormControl } from "@mui/material";

import { notify } from "shell/store/notifications";
import { createFile } from "../../../../../store/files";
import { useParams } from "shell/hooks/useParams";

const tileTypeOptions = [
  { value: "snippet", label: "Snippet (html)" },
  { value: "text/css", label: "CSS File (css)" },
  { value: "text/less", label: "LESS File (less)" },
  { value: "text/scss", label: "SCSS File (scss/sass)" },
  { value: "text/javascript", label: "JavaScript File (js)" },
  {
    value: "ajax-json",
    label: "Custom File Type/Endpoint (Mixed Extensions)",
  },
];

export const CreateFile = memo(function CreateFile(props) {
  const history = useHistory();
  const [params] = useParams();
  const triggerCreate = params.get("triggerCreate");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [name, setName] = useState("");

  const handleClose = () => {
    setName("");
    setType("");
    setOpen(false);
  };

  const handleCreateFile = () => {
    if (!type) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "You must select a file type to create a new file",
        })
      );
      return;
    }
    if (!name) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "You must provide a name for the new file",
        })
      );
      return;
    }

    if (type === "ajax-json" && name.charAt(0) !== "/") {
      props.dispatch(
        notify({
          kind: "warn",
          message: `Please add leading slash in file path EX: /${name}`,
        })
      );
      return;
    }

    setLoading(true);

    props
      .dispatch(createFile(name, type))
      .then((res) => {
        if (res.status === 201) {
          setOpen(false);
          history.push(`/code/file/${res.pathPart}/${res.data.ZUID}`);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (triggerCreate) {
      setOpen(true);
      history.replace("/code");
    }
  }, [triggerCreate]);

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        size="small"
        title="Create File"
        startIcon={<AddIcon />}
        sx={{ justifyContent: "flex-start" }}
      >
        <span>Create File</span>
      </Button>

      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              p: 0,
            },
          }}
        >
          <DialogTitle>
            Create File
            <IconButton
              onClick={handleClose}
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
            <Box sx={{ px: 3, py: 3, backgroundColor: "grey.100" }}>
              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={600}
                  mb={0.25}
                >
                  File Type
                </Typography>
                <Autocomplete
                  value={tileTypeOptions.find((type) => type.value === type)}
                  onChange={(event, newValue) => {
                    setType(newValue?.value || "");
                  }}
                  clearOnEscape
                  options={tileTypeOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      fullWidth
                      placeholder="-- choose a file type --"
                    />
                  )}
                />
              </FormControl>
              {!!type && (
                <Box mb={2}>
                  {type === "snippet" && (
                    <Typography variant="body2" color="text.secondary">
                      Parsley accessible file meant to abstract common use of
                      code, or for organizing file build. Examples: slider,
                      footer, header. These can be used inside of each loops as
                      well.
                    </Typography>
                  )}
                  {type === "text/css" && (
                    <Typography variant="body2" color="text.secondary">
                      A cascading stylesheet that is automatically concatenated
                      into a single css file /main.css which is auto included in
                      the head of webengine web pages. Sort Order of the
                      concatenation can be controlled. No transpiling occurs.
                    </Typography>
                  )}
                  {type === "text/less" && (
                    <Typography variant="body2" color="text.secondary">
                      Has access to settings &gt; variables. A cascading
                      stylesheet that is automatically concatenated into a the
                      single /main.css. Sort Order of the concatenation and
                      transpiling can be controlled.
                    </Typography>
                  )}
                  {type === "text/scss" && (
                    <Typography variant="body2" color="text.secondary">
                      Has access to settings &gt; variables. A cascading
                      stylesheet that is automatically concatenated into a the
                      single /main.css. Sort Order of the concatenation and
                      transpiling can be controlled.
                    </Typography>
                  )}
                  {type === "text/javascript" && (
                    <Typography variant="body2" color="text.secondary">
                      A javascript file that is automatically concatenated into
                      a the single /main.js file that is automatically loaded by
                      webengine. No transpiling occurs.
                    </Typography>
                  )}
                  {type === "ajax-json" && (
                    <Typography variant="body2" color="text.secondary">
                      Parsley accessible file for creating endpoints or custom
                      experiences. These files need to be named with a full path
                      with an extension like{" "}
                      <strong> /my/file/path.json.</strong> The file is
                      accessible at hash-dev.preview.zesty.io/my/file/path.json.
                      File types that can be used: css, html, json, js, xml,
                      csv, tsv, xml, yaml, md, svg, rss, ics, vcf, xhtml.
                    </Typography>
                  )}
                </Box>
              )}

              <FormControl fullWidth size="small">
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={600}
                >
                  File Name
                </Typography>
                <FieldTypeText
                  name="file_name"
                  value={name}
                  onChange={(evt) => setName(evt.target.value)}
                  maxLength={100}
                  size="small"
                />
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",

              px: 3,
              py: 3,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleClose}
              startIcon={<DoDisturbAltIcon />}
            >
              Cancel (ESC)
            </Button>
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={handleCreateFile}
              disabled={type === "" || type === "0" || !name}
              loading={loading}
              loadingPosition="start"
              size="small"
              startIcon={<CheckCircleIcon />}
            >
              Create File
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  );
});
