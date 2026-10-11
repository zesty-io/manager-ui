import {
  FormEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  ButtonBaseActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

export type ConfirmDialogVariant = "destructive" | "warning" | "default";

export type ConfirmDialogProps = {
  open?: boolean;
  variant?: ConfirmDialogVariant;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel?: ReactNode;
  confirmStartIcon?: ReactNode;
  confirmAriaLabel?: string;
  /** Must reject on failure: the dialog stays open and shows the error inline. */
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  getErrorMessage?: (error: unknown) => string | undefined;
  requireText?: string;
  requireTextLabel?: ReactNode;
  requireTextDataCy?: string;
  confirmDataCy?: string;
  dialogDataCy?: string;
  maxWidth?: DialogProps["maxWidth"];
  /** Fixed paper width; `maxWidth` still caps it. */
  width?: number | string;
};

const VARIANTS: Record<
  ConfirmDialogVariant,
  { color: "error" | "warning" | "primary"; circle: string; icon: ReactNode }
> = {
  destructive: {
    color: "error",
    circle: "red.100",
    icon: <DeleteRoundedIcon color="error" />,
  },
  warning: {
    color: "warning",
    circle: "warning.light",
    icon: <WarningRoundedIcon color="warning" />,
  },
  default: {
    color: "primary",
    circle: "blue.100",
    icon: null,
  },
};

/**
 * Reads a message off the rejection shapes this app produces: an `Error`
 * (callers throw these with translated text), or an RTK `.unwrap()` rejection
 * (`{ status, data }`, where the instance API puts the text in `data.error`
 * and the media API in `data.message`). RTK transport failures
 * (`FETCH_ERROR`, `TIMEOUT_ERROR`, `PARSING_ERROR`) carry a raw English JS
 * string in `.error`, so they are deliberately not read and fall through to
 * the generic message.
 */
const getDefaultErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.message || undefined;
  if (typeof error !== "object" || error === null) return undefined;

  const { data } = error as { data?: unknown };
  if (typeof data === "object" && data !== null) {
    const { error: dataError, message } = data as {
      error?: unknown;
      message?: unknown;
    };
    if (typeof dataError === "string" && dataError) return dataError;
    if (typeof message === "string" && message) return message;
  }

  return undefined;
};

export const ConfirmDialog = ({
  open = true,
  variant = "destructive",
  icon,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  confirmStartIcon,
  confirmAriaLabel,
  onConfirm,
  onClose,
  getErrorMessage,
  requireText,
  requireTextLabel,
  requireTextDataCy = "ConfirmDialogRequireTextInput",
  confirmDataCy = "ConfirmDialogConfirmButton",
  dialogDataCy = "ConfirmDialog",
  maxWidth = "xs",
  width,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const requireTextId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  const confirmActionRef = useRef<ButtonBaseActions | null>(null);
  const requireTextInputRef = useRef<HTMLInputElement | null>(null);

  const { color, circle, icon: defaultIcon } = VARIANTS[variant];
  const resolvedIcon = icon === undefined ? defaultIcon : icon;
  const hasRequireText = requireText !== undefined;
  const canConfirm = !hasRequireText || typedText === requireText;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Callers that toggle `open` instead of unmounting get a fresh dialog.
  useEffect(() => {
    if (open) {
      setError(null);
      setTypedText("");
    }
  }, [open]);

  // The loading confirm button (or the disabled input) dropped focus while
  // pending; put it back so Enter retries.
  useEffect(() => {
    if (!error || pending) return;
    if (hasRequireText) {
      requireTextInputRef.current?.focus();
    } else {
      confirmActionRef.current?.focusVisible();
    }
  }, [error, pending, hasRequireText]);

  const handleClose = () => {
    if (pendingRef.current) return;
    onClose();
  };

  // The Paper renders as the <form>, so its handler is typed against the
  // Paper's element rather than HTMLFormElement.
  const handleSubmit = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    // React events bubble through portals: keep this submit from reaching a
    // <form> the caller happens to be rendered inside.
    event.stopPropagation();
    if (pendingRef.current || !canConfirm) return;

    pendingRef.current = true;
    setPending(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      pendingRef.current = false;
      if (mountedRef.current) {
        setPending(false);
        setError(
          getErrorMessage?.(err) ??
            getDefaultErrorMessage(err) ??
            t("shell.confirmDialogGenericError")
        );
      }
      return;
    }

    pendingRef.current = false;
    if (mountedRef.current) {
      setPending(false);
      onClose();
    }
  };

  const hasBody =
    !!description || !!children || hasRequireText || error !== null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      data-cy={dialogDataCy}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
          sx: width !== undefined ? { width } : undefined,
        },
        transition: {
          onEntered: () => {
            if (!hasRequireText) confirmActionRef.current?.focusVisible();
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ pb: hasBody ? 1 : undefined }}>
        {resolvedIcon && (
          <Box
            sx={{
              backgroundColor: circle,
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            {resolvedIcon}
          </Box>
        )}
        {title}
      </DialogTitle>
      {hasBody && (
        <DialogContent>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          {children}
          {hasRequireText && (
            <Box mt={description || children ? 2.5 : 0}>
              {requireTextLabel && (
                <InputLabel htmlFor={requireTextId} sx={{ mb: 1 }}>
                  {requireTextLabel}
                </InputLabel>
              )}
              <TextField
                id={requireTextId}
                autoFocus
                fullWidth
                value={typedText}
                onChange={(event) => setTypedText(event.target.value)}
                disabled={pending}
                inputRef={requireTextInputRef}
                slotProps={{
                  htmlInput: { "data-cy": requireTextDataCy },
                }}
              />
            </Box>
          )}
          {error && (
            <Alert severity="error" data-cy="ConfirmDialogError" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
      )}
      <DialogActions>
        <Button
          data-cy="ConfirmDialogCancelButton"
          variant="text"
          color="inherit"
          onClick={handleClose}
          disabled={pending}
        >
          {cancelLabel ?? t("common.cancel")}
        </Button>
        <Button
          data-cy={confirmDataCy}
          type="submit"
          variant="contained"
          color={color}
          loading={pending}
          disabled={!canConfirm}
          startIcon={confirmStartIcon}
          aria-label={confirmAriaLabel}
          action={confirmActionRef}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
