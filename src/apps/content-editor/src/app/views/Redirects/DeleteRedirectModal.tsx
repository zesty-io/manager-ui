import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Stack,
  Button,
  DialogActions,
  Link,
} from "@mui/material";
import { DeleteRounded, Description, HiveRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";

import { useDomain } from "../../../../../../shell/hooks/use-domain";
import { useDeleteRedirectMutation } from "../../../../../../shell/services/instance";
import { notify } from "../../../../../../shell/store/notifications";
import { RedirectsTargetType } from "../../../../../../shell/services/types";

// Values are i18n keys; resolved with t() inside the component.
const HTTP_CODE_OPTIONS = {
  301: "content.redirectCode301",
  302: "content.redirectCode302",
} as const;

type DeleteRedirectModalProps = {
  targetPath: string;
  incomingPath: string;
  ZUID: string;
  httpCode: number;
  targetType: RedirectsTargetType;
  onClose: () => void;
};
export const DeleteRedirectModal = ({
  targetPath,
  incomingPath,
  ZUID,
  httpCode,
  targetType,
  onClose,
}: DeleteRedirectModalProps) => {
  const { t } = useTranslation();
  const domain = useDomain();
  const dispatch = useDispatch();
  const [
    deleteRedirect,
    { isLoading: isDeletingRedirect, isSuccess: isRedirectDeleted },
  ] = useDeleteRedirectMutation();

  useEffect(() => {
    if (isRedirectDeleted) {
      onClose();
      dispatch(
        notify({
          message: t("content.redirectDeletedPath", { path: incomingPath }),
          kind: "error",
        })
      );
    }
  }, [isRedirectDeleted]);

  const handleDelete = () => {
    deleteRedirect({ ZUID });
  };

  return (
    <Dialog
      open
      slotProps={{
        paper: {
          sx: {
            maxWidth: 480,
          },
        },
      }}
      onClose={onClose}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "red.100",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DeleteRounded color="error" />
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                {t("content.redirectDeleteTitle")}&nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {incomingPath}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t("content.redirectDeleteWarning")}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" fontWeight={700} mb={2.5}>
          {t("content.redirectMoreDetails")}
        </Typography>
        <Stack width="100%" border={1} borderColor="border" borderRadius={2}>
          <Stack direction="row" height={54} alignItems="center" px={2}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ flexBasis: 160 }}
            >
              {t("content.itemEditMetaHttpCode")}
            </Typography>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {t(HTTP_CODE_OPTIONS[httpCode as keyof typeof HTTP_CODE_OPTIONS])}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            height={54}
            alignItems="center"
            borderTop={1}
            borderBottom={1}
            borderColor="border"
            px={2}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ flexBasis: 160 }}
            >
              {t("content.redirectTypeColumn")}
            </Typography>
            <RedirectType type={targetType} />
          </Stack>
          <Stack direction="row" height={54} alignItems="center" px={2}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ flexBasis: 160 }}
            >
              {t("content.redirectTargetLabel")}
            </Typography>
            <Link
              variant="body2"
              href={`${domain}${targetPath}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flex: 1 }}
            >
              {targetPath}
            </Link>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isDeletingRedirect}
        >
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="ConfirmDeleteRedirect"
          variant="contained"
          color="error"
          onClick={handleDelete}
          loading={isDeletingRedirect}
        >
          {t("content.redirectDeleteForever")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RedirectType = ({ type }: { type: RedirectsTargetType }) => {
  const { t } = useTranslation();

  if (type === "path") {
    return (
      <Stack direction="row" alignItems="center" gap={1.5}>
        <HiveRounded fontSize="small" color="action" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          {t("content.redirectTypeWildcard")}
        </Typography>
      </Stack>
    );
  }

  if (type === "page") {
    return (
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Description fontSize="small" color="action" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          {t("content.redirectTypeInternal")}
        </Typography>
      </Stack>
    );
  }

  return <></>;
};
