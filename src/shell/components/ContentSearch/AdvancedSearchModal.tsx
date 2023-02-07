import { FC, useState } from "react";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/system";
import { FieldTypeText } from "@zesty-io/material";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { useHistory } from "react-router";
import { Menu, MenuItem, Select } from "@mui/material";
import { PresetDateRange } from "../../store/media-revamp";

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

export const AdvancedSearchDialog: FC<ModalProps> = ({
  open,
  onClose,
  children,
}) => {
  const [query, setQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<PresetDateRange["value"] | "">("");
  const history = useHistory();
  const clearAll = () => {
    setQuery("");
  };
  const search = () => {
    console.log("searching");
    onClose();
    // filter params
    const params = new URLSearchParams({
      q: query.trim(),
    });
    if (dateRange !== "") {
      params.set("dateFilter", dateRange.replace(/\s/g, ""));
    }
    history.push("/search?" + params.toString());
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="xs">
        <DialogTitle component="div">
          <Typography variant="h5" sx={{ mb: 1 }}>
            Advanced Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As you and your team work together in Zesty, you'll create a
            searchable archive of content, models and code files. Use the form
            below to find what you are looking for.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography fontWeight="bold">Keywords*</Typography>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="ex. Articles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Typography fontWeight="bold">Date</Typography>
          <Select
            fullWidth
            variant="outlined"
            value={dateRange}
            onChange={(evt) => {
              console.log(evt);
              setDateRange(evt.target.value as PresetDateRange["value"]);
            }}
            placeholder="Select"
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="last 7 days">Last 7 Days</MenuItem>
            <MenuItem value="last 30 days">Last 30 Days</MenuItem>
            <MenuItem value="last 3 months">Last 3 Months</MenuItem>
            <MenuItem value="last 12 months">Last 12 Months</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={clearAll} variant="outlined" color="inherit">
            Clear All
          </Button>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button onClick={onClose} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button
              onClick={search}
              variant="contained"
              disabled={query.length === 0}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
