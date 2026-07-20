import { CloseRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import RedirectsDialogContextProvider from "../../../../../../../seo/src/app/components/RedirectsDialogProvider";
import { ItemEditHeaderActions } from "../ItemEditHeader/ItemEditHeaderActions";
import { VersionSelector } from "../ItemEditHeader/VersionSelector";

type StudioSidePanelProps = {
  headerTitle: string;
  selectedItemLabel: string;
  pageItemVersion: number | null;
  unresolvedPath: boolean;
  panelMode: "info" | "edit";
  clearSelection: () => void;
  activeVersion: number;
  selectedModelZUID: string;
  selectedItemZUID: string;
  isSaving: boolean;
  hasErrors: boolean;
  isSelectedItemLoading: boolean;
  onEditInManager: () => void;
  onSave: () => void;
  editorPanel: ReactNode;
  infoPanel: ReactNode;
  drawerWidth: number;
  logoSrc: string;
};

export const StudioSidePanel = ({
  headerTitle,
  selectedItemLabel,
  pageItemVersion,
  unresolvedPath,
  panelMode,
  clearSelection,
  activeVersion,
  selectedModelZUID,
  selectedItemZUID,
  isSaving,
  hasErrors,
  isSelectedItemLoading,
  onEditInManager,
  onSave,
  editorPanel,
  infoPanel,
  drawerWidth,
  logoSrc,
}: StudioSidePanelProps) => {
  const { t } = useTranslation();
  return (
    <Drawer
      data-cy="StudioSidePanel"
      variant="permanent"
      anchor="right"
      PaperProps={{
        sx: {
          overflow: "hidden",
          position: "relative",
          width: drawerWidth,
          boxSizing: "border-box",
          borderLeft: (theme) => `1px solid ${theme.palette.border}`,
          backgroundColor: (theme) => theme.palette.grey[50],
        },
      }}
    >
      <Box height="100%" display="flex" flexDirection="column" p={3} gap={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight="600">
                {panelMode === "edit" ? selectedItemLabel : headerTitle}
              </Typography>
              {/* In edit mode the VersionSelector below already shows the
                  selected item's version, so the static label is info-mode only. */}
              {panelMode !== "edit" &&
              pageItemVersion !== null &&
              !unresolvedPath ? (
                <Typography variant="body2" color="text.secondary">
                  v{pageItemVersion}
                </Typography>
              ) : null}
            </Stack>
            {panelMode === "edit" && !unresolvedPath ? (
              <Box>
                <VersionSelector
                  activeVersion={activeVersion}
                  modelZUIDOverride={selectedModelZUID}
                  itemZUIDOverride={selectedItemZUID}
                />
              </Box>
            ) : null}
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            {panelMode === "edit" ? (
              <IconButton
                aria-label={t("content.studioCloseAriaLabel")}
                onClick={clearSelection}
                size="small"
              >
                <CloseRounded />
              </IconButton>
            ) : (
              <Box sx={{ width: 32 }} />
            )}
          </Stack>
        </Stack>
        <Box flex="1" overflow="auto" pr={1}>
          {unresolvedPath ? (
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              color="text.secondary"
            >
              <Typography variant="body2">
                {t("content.studioNoCmsItem")}
              </Typography>
            </Box>
          ) : panelMode === "edit" ? (
            editorPanel
          ) : (
            infoPanel
          )}
        </Box>
        <Box mt="auto">
          {panelMode === "edit" ? (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Button
                variant="text"
                color="inherit"
                onClick={clearSelection}
                disabled={isSaving}
              >
                {t("common.cancel")}
              </Button>
              <RedirectsDialogContextProvider>
                <ItemEditHeaderActions
                  saving={isSaving}
                  onSave={onSave}
                  hasError={hasErrors}
                  isLoadingItem={isSelectedItemLoading}
                  modelZUIDOverride={selectedModelZUID}
                  itemZUIDOverride={selectedItemZUID}
                />
              </RedirectsDialogContextProvider>
            </Stack>
          ) : (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="primary"
              sx={{ mb: 2 }}
              disabled={unresolvedPath}
              onClick={onEditInManager}
            >
              {t("content.studioEditInManager")}
            </Button>
          )}
          <Box
            mt={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <Box
              component="img"
              src={logoSrc}
              alt="Content One"
              sx={{ height: 24 }}
            />
            <Typography
              variant="body3"
              color="text.secondary"
              textAlign="center"
            >
              {t("content.studioAgenticStudioBy")} Content.One
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
