import { FC } from "react";
import { ConfirmDialog } from "@zesty-io/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

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
    <ConfirmDialog
      title={title}
      open={open}
      content={content}
      callback={(data) => console.log(data)}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "flex-start",
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <Button
          variant="text"
          onClick={onCancel}
          color="primary"
          disabled={loading}
          sx={{ alignSelf: "flex-start" }}
        >
          Cancel
        </Button>
        <Box>
          <Button
            variant="text"
            color="error"
            disabled={loading}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={loading}
            onClick={onSave}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </ConfirmDialog>
  );
};
