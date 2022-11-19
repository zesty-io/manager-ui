import { FC } from "react";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { DesktopDatePicker } from "@mui/x-date-pickers-pro";
import { CalendarPicker } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { DialogContent, DialogTitle } from "@mui/material";

type DateFilterModal = {
  open: boolean;
  onClose?: () => void;
};

export const DateFilterModal: FC<DateFilterModal> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignContent="center"
          //padding="16px, 24px, 12px, 24px"
          pt={2}
          px={3}
          pb={1.5}
        >
          <Typography variant="h5">On</Typography>
          <IconButton>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker
            onChange={(...args) => {
              console.log(args);
            }}
            date={new Date()}
            //renderInput={(props) => <TextField {...props} />}
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
