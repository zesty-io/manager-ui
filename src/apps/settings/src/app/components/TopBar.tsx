import { FC, useState } from "react";
import { Box, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useMetaKey } from "../../../../../shell/hooks/useMetaKey";
import { LoadingButtonProps } from "@mui/lab";
import { Tooltip } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { CheckCircleRounded } from "@mui/icons-material";
import ConfirmSaveDialog from "./ConfirmSaveDialog";

type TopBarProps = {
  title: string;
  isNotSaved?: boolean;
  isLoading?: boolean;
  onSave?: (callback: () => void) => void;
  matchPath?: string;
  saveHidden?: boolean;
  titleHidden?: boolean;
};

export const TopBar: FC<TopBarProps> = ({
  title,
  isNotSaved,
  isLoading,
  onSave,
  matchPath,
  saveHidden = false,
  titleHidden = false,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const saveShortcut = useMetaKey("s", () => isNotSaved && setOpen(true));

  const handleSave = () => {
    onSave(() => setOpen(false));
  };

  return (
    <>
      <Box
        width="100%"
        height="84px"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="background.paper"
        borderBottom="2px solid"
        borderColor="grey.100"
        px={4}
        pb={2}
        pt={4}
        sx={{
          boxSizing: "border-box",
          minWidth: "780px",
          columnGap: 4,
        }}
      >
        {titleHidden ? null : (
          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            noWrap
            minWidth="fit-content"
          >
            {title}
          </Typography>
        )}
        {!!children ? children : null}
        {!onSave || saveHidden ? null : (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            columnGap={1}
          >
            <ActionButton
              label={isNotSaved ? "Save" : "Saved"}
              startIcon={<SaveRoundedIcon fontSize="small" />}
              tooltip={isNotSaved ? `Save Settings ${saveShortcut}` : ""}
              onClick={() => setOpen(true)}
              isActive={isNotSaved}
            />
          </Box>
        )}
      </Box>
      {!onSave ? null : (
        <ConfirmSaveDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleSave}
          title={title}
          isSaving={isLoading}
        />
      )}
    </>
  );
};

export type ActionButtonProps = Omit<
  LoadingButtonProps,
  "endIcon" | "disabled" | "loading" | "onClick"
> & {
  tooltip?: string;
  isLoading?: boolean;
  isActive?: boolean;
  label?: string;

  onClick?: () => void;
};

export const ActionButton: FC<ActionButtonProps> = ({
  tooltip,
  isLoading,
  label,
  isActive,
  onClick,
  ...props
}) => {
  return (
    <Tooltip
      enterDelay={500}
      enterNextDelay={500}
      title={tooltip}
      placement="bottom"
    >
      {isActive ? (
        <LoadingButton
          {...props}
          onClick={onClick}
          loading={isLoading}
          variant="contained"
          sx={{ whiteSpace: "nowrap" }}
        >
          {label}
        </LoadingButton>
      ) : (
        <Box display="flex" alignItems="center" columnGap={1} px={1}>
          <CheckCircleRounded
            fontSize="small"
            sx={{ color: "text.disabled" }}
          />
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "text.disabled" }}
          >
            {label}
          </Typography>
        </Box>
      )}
    </Tooltip>
  );
};
