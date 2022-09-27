import { FC } from "react";
import { ConfirmDialog } from "@zesty-io/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";

export type DirtyCodeModal = {
  title: string;
  content: string;
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDiscard: () => void;
};
export const DirtyCodeModal: FC<DirtyCodeModal> = ({
  title,
  content,
  open,
  loading,
  onCancel,
  onSave,
  onDiscard,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <ConfirmDialog
        title={<Typography variant="h5">{title}</Typography>}
        content={<Typography variant="body2">{content}</Typography>}
        open={open}
        callback={() => {} /* TODO fix dialog in DS lib */}
        maxWidth="xs"
        fullWidth
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-start",
            flexDirection: "row",
            justifyContent: "space-between",
            textDecoration: "none",
            flex: 1,
            margin: "8px",
          }}
        >
          <Button
            variant="text"
            onClick={onCancel}
            color="inherit"
            disabled={loading}
            sx={{
              alignSelf: "flex-start",
              textDecoration: "none",
            }}
          >
            Cancel
          </Button>
          <Stack direction="row" sx={{ gap: "8px" }}>
            <Button
              variant="text"
              color="primary"
              disabled={loading}
              onClick={onDiscard}
            >
              Discard
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={onSave}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </ConfirmDialog>
    </ThemeProvider>
  );
};
