import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SearchBox from "../../../../../../shell/components/SearchBox";

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
  const { t } = useTranslation();
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography
        data-cy="AllFilesHeader"
        variant="h3"
        fontWeight={700}
        color="common.white"
        noWrap
      >
        {t("code.allFiles")}
      </Typography>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        columnGap={1}
      >
        <SearchBox
          data-cy="AllFilesSearchInput"
          inputRef={searchInputRef}
          placeholder={t("code.searchFiles")}
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
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />

        <Button
          data-cy="AllFilesCreateButton"
          variant="contained"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ whiteSpace: "nowrap" }}
          onClick={openCreateFileDialog}
        >
          {t("code.createFile")}
        </Button>
      </Box>
    </Box>
  );
};
