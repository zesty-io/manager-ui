import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Box,
  Slide,
  Stack,
  Typography,
  Link,
  InputAdornment,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { isNull } from "lodash";
import SearchIcon from "@mui/icons-material/SearchRounded";

type Props = {};

const SelectDisplayType = ({ step }: { step: number }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Slide direction="left" in mountOnEnter unmountOnExit>
      <Box
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="stretch"
        overflow="hidden"
      >
        <DialogTitle
          component="div"
          flexGrow={0}
          sx={{ height: "128px", minHeight: "128px" }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box width={520}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                Select a Block Type
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start with a blank block or select from our selection of pre
                designed blocks
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <PlayCircleOutlineRoundedIcon color="info" />{" "}
                <Link variant="body2" href="#" underline="always">
                  Learn Blocks basics with a tutorial
                </Link>
              </Box>
            </Box>
            <IconButton size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          data-cy="starter-blocks-selection-dialog"
          sx={{
            py: 2.5,
            backgroundColor: "grey.50",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "stretch",
            rowGap: 2,
            overflowY: "auto",
            overflowX: "hidden",
            flexGrow: 1,
            position: "relative",
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              backgroundColor: "grey.300",
              borderRadius: "4px",
            },
          }}
          dividers
        >
          <Box flexGrow={0}>
            <TextField
              data-cy="starter-blocks-search"
              size="small"
              placeholder="Search variants"
              //   value={search}
              //   onChange={(event) => setSearch(event.target.value)}
              sx={{ width: { xs: "100%", sm: "100%", md: "60%", lg: "60%" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              inputRef={isNull}
            />
          </Box>

          <Box flexGrow={1} position="relative"></Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: "20px",
            flexGrow: 0,
            height: "76px",
            minHeight: "76px",
            maxHeight: "76px",
          }}
        >
          <Button variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button variant="contained" data-cy="select-block-type-next-button">
            Next
          </Button>
        </DialogActions>
      </Box>
    </Slide>
  );
};

export default SelectDisplayType;
