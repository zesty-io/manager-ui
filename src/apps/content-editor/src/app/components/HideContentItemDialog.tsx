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

interface Props {
  open: boolean;
  isHide: boolean;
  item: ContentNavItem;
  onClose: () => void;
}

export const HideContentItemDialog: FC<Readonly<Props>> = ({
  open,
  isHide,
  item,
  onClose,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xs"}>
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
              // history.push("/content/" + selectedModel.ZUID + "/new");
            }}
          >
            {isHide ? `Hide ${item.label}` : `Unhide ${item.label}`}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
