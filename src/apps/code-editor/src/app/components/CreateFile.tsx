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
  title,
}: CreateFileProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("code.createFile");
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
          message: t("code.mustSelectFileType"),
        })
      );
      return;
    }
    if (!name) {
      dispatch(
        notify({
          kind: "warn",
          message: t("code.mustProvideFileName"),
        })
      );
      return;
    }

    if (type === "ajax-json" && name.charAt(0) !== "/") {
      dispatch(
        notify({
          kind: "warn",
          message: t("code.pleaseAddLeadingSlash", { name }),
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
        {resolvedTitle}
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
              {t("code.fileType")}
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
              getOptionLabel={(option) => t(option.label)}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              renderInput={(params) => (
                <TextField {...params} placeholder={t("code.chooseFileType")} />
              )}
            />
          </Box>
          {!!type && (
            <Box mt={2}>
              {type === "snippet" && (
                <Typography variant="body2" color="text.secondary">
                  {t("code.snippetDescription")}
                </Typography>
              )}
              {type === "text/css" && (
                <Typography variant="body2" color="text.secondary">
                  {t("code.cssDescription")}
                </Typography>
              )}
              {type === "text/less" && (
                <Typography variant="body2" color="text.secondary">
                  {t("code.lessDescription")}
                </Typography>
              )}
              {type === "text/scss" && (
                <Typography variant="body2" color="text.secondary">
                  {t("code.scssDescription")}
                </Typography>
              )}
              {type === "text/javascript" && (
                <Typography variant="body2" color="text.secondary">
                  {t("code.javascriptDescription")}
                </Typography>
              )}
              {type === "ajax-json" && (
                <Typography variant="body2" color="text.secondary">
                  {t("code.ajaxJsonDescription")}
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
              {t("code.fileName")}
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
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="CreateFileCreateButton"
          variant="contained"
          color="primary"
          onClick={handleCreateFile}
          disabled={type === "" || type === "0" || !name}
          loading={loading}
        >
          {t("code.createFile")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CreateFile;
