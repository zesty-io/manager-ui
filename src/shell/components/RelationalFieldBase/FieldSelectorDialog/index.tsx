import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import { CloseRounded, Search } from "@mui/icons-material";

import { FieldSelectorFilters } from "./FieldSelectorFilters";

type FieldSelectorDialogProps = {
  onClose: () => void;
  modelZUID: string;
  modelName: string;
};
export const FieldSelectorDialog = ({
  onClose,
  modelZUID,
  modelName,
}: FieldSelectorDialogProps) => {
  const [filterKeyword, setFilterKeyword] = useState<string>(null);
  const [activeSortOrder, setActiveSortOrder] = useState<string>("lastSaved");

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 800,
          maxWidth: 800,
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          pt: 4,
          pb: 2,
          px: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          Select {modelName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        id="fieldSelectorDialogBody"
        sx={{
          pb: 2,
          px: 4,
          bgcolor: "grey.50",
          borderTop: 1,
          borderColor: "border",
          display: "flex",
          flexDirection: "column",
          gap: 2,

          "&#fieldSelectorDialogBody": {
            pt: 2,
          },
        }}
      >
        <TextField
          fullWidth
          value={filterKeyword}
          onChange={(evt) => setFilterKeyword(evt.currentTarget.value)}
          size="small"
          placeholder="Filter Items"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FieldSelectorFilters
          modelZUID={modelZUID}
          activeSortOrder={activeSortOrder}
          onUpdateActiveSortOrder={(sortOrder) => setActiveSortOrder(sortOrder)}
        />
      </DialogContent>
    </Dialog>
  );
};
