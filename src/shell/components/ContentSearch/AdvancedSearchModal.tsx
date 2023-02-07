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
  const history = useHistory();
  const clearAll = () => {
    setQuery("");
  };
  const search = () => {
    console.log("searching");
    onClose();
    const p = new URLSearchParams({
      q: query,
    });
    history.push("/search?" + p.toString());
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
