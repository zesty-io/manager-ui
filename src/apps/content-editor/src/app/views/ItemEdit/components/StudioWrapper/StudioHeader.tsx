import { Box, Button } from "@mui/material";
import { LanguageSelector } from "../ItemEditHeader/LanguageSelector";

type StudioHeaderProps = {
  onLanguageChange: (langCode: string) => void;
  interactionMode: "content" | "layout";
  onInteractionModeChange: (mode: "content" | "layout") => void;
  pageModelZUID: string;
  pageItemZUID: string;
  unresolvedPath: boolean;
  logoSrc: string;
};

export const StudioHeader = ({
  onLanguageChange,
  interactionMode,
  onInteractionModeChange,
  pageModelZUID,
  pageItemZUID,
  unresolvedPath,
  logoSrc,
}: StudioHeaderProps) => {
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
      <Box display="flex" gap={1}>
        <Button
          size="small"
          variant={interactionMode === "content" ? "contained" : "outlined"}
          onClick={() => onInteractionModeChange("content")}
        >
          Content
        </Button>
        <Button
          size="small"
          variant={interactionMode === "layout" ? "contained" : "outlined"}
          onClick={() => onInteractionModeChange("layout")}
        >
          Layout
        </Button>
      </Box>
      <Box flex="1" />
      <Box minWidth={96}>
        <LanguageSelector
          modelZUIDOverride={pageModelZUID}
          itemZUIDOverride={pageItemZUID}
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
