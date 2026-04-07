import { FC } from "react";
import { ConfirmDialog } from "@zesty-io/material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type DirtyCodeModal = {
  title: string;
  content: string;
  open: boolean;
  loading: boolean;
  saveDisabled?: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDiscard: () => void;
};
export const DirtyCodeModal: FC<DirtyCodeModal> = ({
  title,
  content,
  open,
  loading,
  saveDisabled = false,
  onCancel,
  onSave,
  onDiscard,
}) => {
  return (
    <ConfirmDialog
      title={<Typography variant="h5">{title}</Typography>}
      content={<Typography variant="body2">{content}</Typography>}
      open={open}
      callback={() => {} /* TODO fix dialog in DS lib */}
      maxWidth="xs"
      fullWidth
    >
      <Stack
        data-cy="DirtyCodeModal"
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
          data-cy="DirtyCodeModalCancel"
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
            data-cy="DirtyCodeModalDiscard"
            variant="text"
            color="primary"
            disabled={loading}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            data-cy="DirtyCodeModalSave"
            variant="contained"
            color="primary"
            disabled={loading || saveDisabled}
            onClick={onSave}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </ConfirmDialog>
  );
};
