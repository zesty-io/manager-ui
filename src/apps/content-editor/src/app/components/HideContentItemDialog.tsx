import { FC, useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Stack,
  SvgIcon,
} from "@mui/material";
import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";

import { ContentNavItem } from "../../../../../shell/services/types";
import { TreeItem } from "../../../../../shell/components/NavTree";

interface Props {
  isHide: boolean;
  item: TreeItem;
  onClose: () => void;
  onToggleItemHideStatus: (item: TreeItem) => void;
}

export const HideContentItemDialog: FC<Readonly<Props>> = ({
  isHide,
  item,
  onClose,
  onToggleItemHideStatus,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Dialog open onClose={onClose} fullWidth maxWidth={"xs"}>
        <DialogContent sx={{ mt: 2.5 }}>
          <Stack>
            <SvgIcon
              component={isHide ? VisibilityOffRounded : VisibilityRounded}
              color="primary"
              sx={{
                padding: "8px",
                borderRadius: "20px",
                backgroundColor: "deepOrange.50",
                display: "block",
                mb: 1.5,
              }}
            />
            <Typography variant="h5" fontWeight={600} mb={1}>
              {isHide ? `Hide ${item.label}?` : `Unhide ${item.label}?`}
            </Typography>
            {isHide ? (
              <>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  This will shift the {item.label} content item from the pages
                  section to the hidden items section below. We recommend only
                  using this feature to declutter up your content navigation
                  tree from items you do not access very often.
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  This will not hide any of your articles from your live website
                  or app.
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                This will shift the {item.label} content item from the Hidden
                Items section to the Pages section above.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onClose();
              onToggleItemHideStatus(item);
            }}
          >
            {isHide ? `Hide ${item.label}` : `Unhide ${item.label}`}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
