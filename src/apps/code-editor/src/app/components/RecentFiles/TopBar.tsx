import React, { FC } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

type TopBarProps = {
  searchKeyword: string;
  setSearchKeyword: (text: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  openCreateFileDialog: () => void;
};

export const TopBar: FC<TopBarProps> = ({
  searchKeyword,
  setSearchKeyword,
  searchInputRef,
  openCreateFileDialog,
}) => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="h3" fontWeight={700} color="common.white" noWrap>
        All Files
      </Typography>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        columnGap={1}
      >
        <TextField
          inputRef={searchInputRef}
          placeholder="Search Files"
          size="small"
          color="primary"
          sx={{
            width: "240px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                border: "2px  solid",
                borderColor: "primary.main",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          inputProps={{
            style: {
              padding: "6px 0",
            },
          }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <Button
          variant="contained"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ whiteSpace: "nowrap" }}
          onClick={openCreateFileDialog}
        >
          Create File
        </Button>
      </Box>
    </Box>
  );
};
