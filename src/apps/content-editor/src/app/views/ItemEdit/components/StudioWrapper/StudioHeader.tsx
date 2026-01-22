import { RefreshRounded } from "@mui/icons-material";
import { Box, IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { KeyboardEvent } from "react";
import { LanguageSelector } from "../ItemEditHeader/LanguageSelector";

type StudioHeaderProps = {
  previewUrl: string;
  onPreviewUrlChange: (next: string) => void;
  onPreviewUrlSubmit: () => void;
  onRefresh: () => void;
  onLanguageChange: (langCode: string) => void;
  currentModelZUID: string;
  currentItemZUID: string;
  unresolvedPath: boolean;
  logoSrc: string;
};

export const StudioHeader = ({
  previewUrl,
  onPreviewUrlChange,
  onPreviewUrlSubmit,
  onRefresh,
  onLanguageChange,
  currentModelZUID,
  currentItemZUID,
  unresolvedPath,
  logoSrc,
}: StudioHeaderProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onPreviewUrlSubmit();
  };

  return (
    <Box
      sx={{
        py: 1,
        px: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: (theme) => `1px solid ${theme.palette.border}`,
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="Content One"
        sx={{ height: 32 }}
      />
      <OutlinedInput
        fullWidth
        size="small"
        value={previewUrl}
        onChange={(event) => onPreviewUrlChange(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              size="xsmall"
              aria-label="Refresh preview"
              onClick={onRefresh}
            >
              <RefreshRounded fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
      />
      <Box minWidth={96}>
        <LanguageSelector
          modelZUIDOverride={currentModelZUID}
          itemZUIDOverride={currentItemZUID}
          onChange={({ langCode }) => {
            if (!langCode) return;
            onLanguageChange(langCode);
          }}
          disabled={unresolvedPath}
        />
      </Box>
    </Box>
  );
};
