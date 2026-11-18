import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography, Box } from "@mui/material";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../shell/store/notifications";
import { ConfirmDialog } from "../../../../../../shell/components/ConfirmDialog";

import { useDeleteRedirectMutation } from "../../../../../../shell/services/instance";

export type DeleteRedirectsProps = {
  ZUID: string;
  path: string;
};

export type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  redirects: DeleteRedirectsProps[];
};

export const DeleteDialog: FC<DeleteDialogProps> = ({
  open,
  onClose,
  redirects,
}) => {
  const { t } = useTranslation();
  const [deleteRedirect] = useDeleteRedirectMutation();
  // Narrowed to the failed redirects after a partial failure, so a retry
  // only re-sends those.
  const [remaining, setRemaining] = useState(redirects ?? []);

  const dispatch = useDispatch();

  const descriptionPart =
    remaining.length < 2
      ? t("seo.deleteRedirectDescriptionSingular")
      : t("seo.deleteRedirectDescriptionPlural", { count: remaining.length });

  const handleDeleteRedirects = async () => {
    const results = await Promise.allSettled(
      remaining.map((redirect) =>
        deleteRedirect({ ZUID: redirect?.ZUID }).unwrap()
      )
    );
    const failed = remaining.filter(
      (_, index) => results[index].status === "rejected"
    );

    if (failed.length) {
      setRemaining(failed);
      throw new Error(t("seo.errorDeletingRedirects"));
    }

    dispatch(
      notify({
        kind: "success",
        message: t("seo.redirectDeleted", { count: redirects?.length }),
      })
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDeleteRedirects}
      confirmDataCy="DeleteContentItemConfirmButton"
      confirmLabel={t("seo.deleteRedirectsButton", {
        count: remaining.length,
      })}
      title={
        <Box component="span" data-cy="RedirectsDeleteDialogHeader">
          {t("seo.deleteRedirectTitle", { count: remaining.length })}
        </Box>
      }
      description={`${descriptionPart} ${t(
        "seo.deleteRedirectDescriptionSuffix",
        {
          count: remaining.length,
        }
      )}`}
    >
      <Box
        data-cy="RedirectsDeleteDialog"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        rowGap="20px"
        mt={2.5}
      >
        {remaining.map((redirect, index) => (
          <Box
            key={redirect?.ZUID}
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="baseline"
            columnGap="5px"
          >
            <Typography
              variant="body2"
              color="info.dark"
              width="20px"
              flexGrow={0}
              flexShrink={0}
            >
              {`${index + 1}.`}
            </Typography>
            <Typography
              variant="body2"
              color="info.dark"
              flexGrow={1}
              flexShrink={1}
            >
              {redirect?.path}
            </Typography>
          </Box>
        ))}
      </Box>
    </ConfirmDialog>
  );
};
