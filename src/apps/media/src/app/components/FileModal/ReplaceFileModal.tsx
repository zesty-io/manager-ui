import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Alert,
  Button,
} from "@mui/material";

type ReplaceFileModalProps = {
  src: string;
  filename: string;
  ZUID: string;
  onClose: () => void;
};
export const ReplaceFileModal = ({
  src,
  filename,
  ZUID,
  onClose,
}: ReplaceFileModalProps) => {
  return <Dialog open onClose={onClose} maxWidth="xs"></Dialog>;
};
