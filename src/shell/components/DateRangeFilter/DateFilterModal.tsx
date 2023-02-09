import { FC, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { CalendarPicker } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { DialogContent, DialogTitle, DialogProps } from "@mui/material";
import { DateRange } from "../../store/media-revamp";

type DateFilterModal = {
  open: boolean;
  type: "on" | "before" | "after";
  onClose: () => void;
  setDateCallback: (date: Date) => void;
  activeFilter: DateRange;
};

export const DateFilterModal: FC<DateFilterModal> = ({
  open,
  onClose,
  type,
  setDateCallback,
  activeFilter,
}) => {
  const highlightedDate = useMemo(() => {
    if (activeFilter && activeFilter.type === type) {
      return new Date(activeFilter.value);
    } else return new Date();
  }, [activeFilter, type]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignContent="center"
        >
          <Typography variant="h5" sx={{ textTransform: "capitalize" }}>
            {type}
          </Typography>
          <IconButton onClick={() => onClose()}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker
            onChange={(date, state) => {
              setDateCallback(date);
              onClose();
            }}
            date={highlightedDate}
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
