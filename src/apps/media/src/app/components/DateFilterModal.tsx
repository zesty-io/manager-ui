import { FC, useMemo } from "react";
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
import { DialogContent, DialogTitle, DialogProps } from "@mui/material";
import {
  DateRange,
  setDateRangeFilter,
} from "../../../../../shell/store/media-revamp";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../shell/store/types";

type DateFilterModal = {
  open: boolean;
  type: "on" | "before" | "after";
  //onClose: DialogProps["onClose"];
  onClose: (data?: any) => void;
};

export const DateFilterModal: FC<DateFilterModal> = ({
  open,
  onClose,
  type,
}) => {
  const dispatch = useDispatch();
  const activeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.dateRangeFilter
  );
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
          //padding="16px, 24px, 12px, 24px"
          pt={2}
          px={3}
          pb={1.5}
        >
          <Typography variant="h5" sx={{ textTransform: "capitalize" }}>
            {type}
          </Typography>
          <IconButton
            //@ts-ignore
            onClick={() => onClose()}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker
            onChange={(...args) => {
              console.log(args);
              dispatch(
                setDateRangeFilter({
                  type,
                  value: args[0].toISOString(),
                })
              );
              onClose();
            }}
            date={highlightedDate}
            //renderInput={(props) => <TextField {...props} />}
          />
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
