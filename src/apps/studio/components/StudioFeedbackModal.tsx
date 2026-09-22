import { useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useSendEmailMutation } from "shell/services/cloudFunctions";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppState } from "shell/store/types";
import { InteractionMode } from "../hooks/studioTypes";

// `value` is typed as required `string` on every caller's prop, but several
// callers pass Redux fields (e.g. `instance?.name`) that are `any` at the
// state layer and genuinely `undefined` until their slice finishes loading —
// coalesce defensively rather than trust the prop type.
const escapeHtml = (value: string): string =>
  (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type StudioFeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  instanceName: string;
  instanceZUID: string;
  activePage: string;
  mode: InteractionMode;
};

export const StudioFeedbackModal = ({
  open,
  onClose,
  email,
  instanceName,
  instanceZUID,
  activePage,
  mode,
}: StudioFeedbackModalProps) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = useSelector((state: AppState) => state.user);
  const [sendEmail, { isLoading: isSubmitting }] = useSendEmailMutation();
  // `isSubmitting` only updates on the next render, which isn't fast enough
  // to block a second click fired in the same tick as the first (e.g. a fast
  // double-click) — this ref is set synchronously so the very next call to
  // handleSubmit sees the lock immediately, before React re-renders.
  const isSubmittingRef = useRef(false);

  const handleClose = () => {
    if (isSubmitting || isSubmittingRef.current) return;
    setMessage("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!message.trim() || isSubmitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setError("");

    const feedbackName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");
    const feedbackSubject = `Studio feedback from ${escapeHtml(
      feedbackName || email
    )}`;

    const feedbackBody = [
      `<b>User:</b> ${escapeHtml(email)}`,
      `<b>Instance:</b> ${escapeHtml(instanceZUID)} (${escapeHtml(
        instanceName
      )})`,
      `<b>Page:</b> ${escapeHtml(activePage)}`,
      `<b>Mode:</b> ${escapeHtml(mode)}`,
      `<b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}`,
    ].join("<br>");

    sendEmail({
      to: CONFIG.SLACK_FEEDBACK_EMAIL,
      subject: feedbackSubject,
      body: feedbackBody,
      template: "raw",
    })
      .unwrap()
      .then(() => {
        isSubmittingRef.current = false;
        setMessage("");
        onClose();
      })
      .catch(() => {
        isSubmittingRef.current = false;
        setError(t("content.feedbackSendError"));
      });
  };

  return (
    <Dialog
      data-cy="StudioFeedbackModal"
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        <Box sx={{ fontWeight: 700 }}>{t("content.shareFeedback")}</Box>
        <Typography sx={{ mt: 0.5 }} variant="body2" color="text.secondary">
          {t("content.feedbackModalSubtitle")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          {t("content.feedbackExperiencePrompt")}
        </Typography>
        <TextField
          data-cy="StudioFeedbackMessageInput"
          fullWidth
          multiline
          minRows={4}
          placeholder={t("content.feedbackPlaceholder")}
          value={message}
          onChange={(evt) => setMessage(evt.target.value)}
          disabled={isSubmitting}
          sx={{ mt: 1 }}
        />
        {error ? (
          <Typography
            data-cy="StudioFeedbackErrorMessage"
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="StudioFeedbackCancelButton"
          color="inherit"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="StudioFeedbackSubmitButton"
          variant="contained"
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          loading={isSubmitting}
        >
          {t("content.shareFeedback")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
