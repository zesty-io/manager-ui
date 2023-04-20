import { FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  Select,
} from "@mui/material";

interface AdvancedSearch {
  keyword: string;
  onClose: () => void;
}
export const AdvancedSearch: FC<AdvancedSearch> = ({ keyword, onClose }) => {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle component="div">
        <Typography>Advanced Search</Typography>
        <Typography>
          As you and your team work together in Zesty, you'll create a
          searchable archive of content, models, and code files. Use the form
          below to find what you are looking for.
        </Typography>
      </DialogTitle>
      <DialogContent>{keyword}</DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};
