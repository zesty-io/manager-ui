import { useState } from "react";
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
import { AppState } from "shell/store/types";

type StudioFeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
};

export const StudioFeedbackModal = ({
  open,
  onClose,
  email,
}: StudioFeedbackModalProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = useSelector((state: AppState) => state.user);
  const [sendEmail, { isLoading: isSubmitting }] = useSendEmailMutation();

  const handleClose = () => {
    if (isSubmitting) return;
    setMessage("");
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!message.trim() || isSubmitting) return;

    setError("");

    sendEmail({
      to: CONFIG.SLACK_FEEDBACK_EMAIL,
      from: email,
      subject: `${user?.firstName} ${user?.lastName}`,
      body: message,
      template: "raw",
    })
      .unwrap()
      .then(() => {
        setMessage("");
        onClose();
      })
      .catch(() => {
        setError("Couldn't send feedback. Try again.");
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
        <Box sx={{ fontWeight: 700 }}>Share Feedback</Box>
        <Typography sx={{ mt: 0.5 }} variant="body2" color="text.secondary">
          Please tell us about your experience so we can improve.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          How was your experience with studio-mode
        </Typography>
        <TextField
          data-cy="StudioFeedbackMessageInput"
          fullWidth
          multiline
          minRows={4}
          placeholder="This is a feedback message"
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
          Cancel
        </Button>
        <Button
          data-cy="StudioFeedbackSubmitButton"
          variant="contained"
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          loading={isSubmitting}
        >
          Share Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};
