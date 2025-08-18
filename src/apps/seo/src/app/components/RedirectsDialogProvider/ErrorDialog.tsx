import { FC, useCallback, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { DialogContent } from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Chip } from "@mui/material";
import { CreateRedirectErrors, ErrorPathProps } from "./constants";
import { useRedirectsDialog } from ".";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../shell/store/notifications";

type ErrorDialogProps = {
  open: boolean;
  onClose: () => void;
  data: CreateRedirectErrors;
};

export const ErrorDialog: FC<ErrorDialogProps> = ({ open, onClose, data }) => {
  const dispatch = useDispatch();

  const [errorPaths, setErrorPaths] = useState<ErrorPathProps[]>([]);

  const { createRedirects, updateRedirect, closeErrorDialog, isLoading } =
    useRedirectsDialog();

  const handleResubmit = useCallback(async () => {
    const isEdit = !!data?.ZUID;
    const paths = errorPaths?.map((error) => error?.path?.trim());

    let response = null;

    if (isEdit) {
      response = await updateRedirect({
        path: paths[0],
        targetType: data?.targetType,
        code: data?.code,
        target: data?.target,
        ZUID: data?.ZUID,
      });
    } else {
      response = await createRedirects({
        paths: paths,
        target: data?.target,
        targetType: data?.targetType,
        code: data?.code,
      });
    }
    const errorPathRes = response
      ?.filter((item: any) => item?.status === "error")
      .map((item: any) => item?.path?.trim());

    if (!errorPathRes?.length) {
      dispatch(
        notify({
          kind: "success",
          message: !isEdit
            ? `${paths?.length} Redirect${paths?.length > 1 ? "s" : ""} Created`
            : `Redirect Saved: ${paths[0]}`,
        })
      );
      closeErrorDialog();
      return;
    }

    const updatedErrorPaths = errorPaths?.filter((error) =>
      errorPathRes?.includes(error?.path?.trim())
    );

    setErrorPaths(updatedErrorPaths);
  }, [data, errorPaths]);

  useEffect(() => {
    const pathErrors = data?.errors?.map((error) => {
      return {
        error: error?.error,
        path: error?.path?.trim(),
      };
    });
    setErrorPaths(pathErrors);
  }, [data]);

  return (
    <>
      <Dialog
        data-cy="RedirectsErrorDialog"
        open={open}
        fullWidth
        maxWidth={false}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: "480px",
            },
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              backgroundColor: "red.100",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <WarningAmberRoundedIcon color="error" />
          </Box>

          <Typography
            variant="inherit"
            fontWeight={700}
            flexGrow={0}
            flexShrink={0}
            data-cy="RedirectsErrorDialogHeader"
          >
            {`${errorPaths?.length} Redirect${
              errorPaths?.length > 1 ? "s" : ""
            } couldn't be created`}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: "8px" }}>
            The following paths couldn't be saved as redirects.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            data-cy="RedirectsErrorDialogListContainer"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "stretch",
              rowGap: "20px",
            }}
          >
            {errorPaths?.map((error) => (
              <Box
                className="RedirectsErrorListItem"
                key={error?.path}
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                columnGap={1}
                width="100%"
              >
                <Typography variant="body2" color="info.dark" flexGrow={1}>
                  {error?.path}
                </Typography>
                <Chip
                  size="small"
                  label={error.error}
                  color={error?.error !== "error" ? "warning" : "error"}
                  sx={{ flexGrow: 0 }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: "20px" }}>
          <Button
            data-cy="RedirectsErrorDialogTryAgainButton"
            variant="text"
            color="inherit"
            size="medium"
            loading={isLoading}
            onClick={handleResubmit}
          >
            Try Again
          </Button>
          <Button
            data-cy="RedirectsErrorDialogDoneButton"
            variant="contained"
            color="primary"
            size="medium"
            onClick={onClose}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ErrorDialog;
