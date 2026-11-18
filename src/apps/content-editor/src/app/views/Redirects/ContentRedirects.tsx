import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import { Button, Typography, Box } from "@mui/material";

import { Paper, Skeleton } from "@mui/material";
import {
  Redirects,
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../shell/store/notifications";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import { ContentItemProps } from "../../../../../seo/src/app/components/RedirectsDialogProvider/constants";
import { ContentRedirectModal } from "./ContentRedirectModal";
import { useDeleteRedirectMutation } from "../../../../../../shell/services/instance";
import { ConfirmDialog } from "../../../../../../shell/components/ConfirmDialog";
import DescriptionIcon from "@mui/icons-material/Description";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { ListOptionSkeleton } from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/SearchField";

// Text fields hold i18n keys; t() can't run at module scope so the lookup
// happens inside the component.
const REDIRECTED = {
  button: "content.redirectStopRedirecting",
  icon: <StopRoundedIcon color="error" />,
  header: "content.redirectActiveHeader",
  subHeader: "content.redirectActiveSubHeader",
};
const NOT_REDIRECTED = {
  button: "content.redirectThisContentItem",
  icon: <ShuffleRoundedIcon color="primary" />,
  header: "content.redirectThisContentItem",
  subHeader: "content.redirectInactiveSubHeader",
};

export type ChangeRedirectProps = {
  targetType: RedirectsTargetType;
  target: string;
  path: string;
  code: RedirectsCodes;
};

export type ContentRedirectsProps = {
  itemZUID: string;
  isLoading: boolean;
  options: ContentItemProps[] | [];
  redirects?: Redirects[] | [];
};

const RedirectItem = ({
  ZUID,
  targetType,
  path,
  target,
  langCode,
  label,
  isLoading = false,
}: {
  ZUID: string;
  targetType: RedirectsTargetType;
  path: string;
  target: string;
  langCode: string;
  label: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return <ListOptionSkeleton count={1} />;
  }
  return (
    <>
      {targetType !== "page" ? (
        <Typography variant="body2" data-cy="RedirectTargetUrl">
          {target}
        </Typography>
      ) : (
        <Box
          key={ZUID}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          flexGrow={1}
          columnGap={1.5}
          sx={{
            width: "100%",
          }}
        >
          {targetType === "page" ? (
            <DescriptionIcon fontSize="small" color="action" />
          ) : (
            <FormatListBulletedIcon fontSize="small" color="action" />
          )}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="stretch"
            flexGrow={1}
            sx={{
              overflow: "hidden",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="body2"
              color="text.primary"
              noWrap
              textOverflow="ellipsis"
              overflow="hidden"
              fontWeight={500}
            >
              {`(${langCode}) ${label?.trim()}`}
            </Typography>
            <Typography
              data-cy="RedirectTargetUrl"
              variant="body2"
              color="info.dark"
              noWrap
              textOverflow="ellipsis"
              maxWidth="100%"
              overflow="hidden"
            >
              {target}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

const ContentRedirects: FC<ContentRedirectsProps> = ({
  itemZUID,
  isLoading,
  options = [],
  redirects = [],
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRedirect] = useDeleteRedirectMutation();
  const [isRedirected, setIsRedirected] = useState(false);
  const [redirection, setRedirection] = useState<Redirects | null>(null);

  const currentItem = options?.find((option) => option?.ZUID === itemZUID);

  useEffect(() => {
    const redirectData = redirects?.find(
      (redirect) => redirect?.path === currentItem?.path
    );

    if (!!redirectData) {
      setRedirection(redirectData);
      setIsRedirected(true);
    } else {
      setRedirection(null);
      setIsRedirected(false);
    }
  }, [options, itemZUID, redirects, currentItem]);

  return (
    <>
      <Box
        width={640}
        flexGrow={0}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
      >
        <Typography
          variant="h5"
          fontWeight={700}
          color="text.primary"
          data-cy="ContentRedirectHeader"
        >
          {t(!!isRedirected ? REDIRECTED.header : NOT_REDIRECTED.header)}
        </Typography>
        <Typography variant="body2" color="text.secondary" pt={0.5} pb={1.5}>
          {t(!!isRedirected ? REDIRECTED.subHeader : NOT_REDIRECTED.subHeader)}
        </Typography>
        {!isLoading && (!isRedirected || !currentItem) ? null : (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              width: "100%",
              py: 1,
              px: 2,
              borderColor: "border",
              borderRadius: 2,
            }}
          >
            <RedirectItem
              ZUID={redirection?.ZUID}
              targetType={redirection?.targetType}
              path={redirection?.path}
              target={
                redirection?.targetType !== "page"
                  ? redirection?.target
                  : options?.find(
                      (option) => option?.ZUID === redirection?.target
                    )?.path
              }
              langCode={
                redirection?.targetType !== "page"
                  ? ""
                  : options?.find(
                      (option) => option?.ZUID === redirection?.target
                    )?.langCode
              }
              label={
                redirection?.targetType !== "page"
                  ? ""
                  : options?.find(
                      (option) => option?.ZUID === redirection?.target
                    )?.label
              }
              isLoading={isLoading}
            />
          </Paper>
        )}

        <Button
          data-cy="RedirectContentItemButton"
          variant="outlined"
          color={!!isRedirected ? "primary" : "error"}
          startIcon={!!isRedirected ? REDIRECTED.icon : NOT_REDIRECTED.icon}
          onClick={() =>
            !!isRedirected ? setIsDeleteModalOpen(true) : setIsOpen(true)
          }
          sx={{ mt: 1.5 }}
        >
          {t(!!isRedirected ? REDIRECTED.button : NOT_REDIRECTED.button)}
        </Button>
      </Box>
      {isOpen && (
        <ContentRedirectModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          options={options}
          loading={isLoading}
          currentItem={currentItem}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmDialog
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() =>
            deleteRedirect({ ZUID: redirection?.ZUID })
              .unwrap()
              .then(() => {
                dispatch(
                  notify({
                    kind: "success",
                    message: t("content.redirectDeletedOne"),
                  })
                );
              })
          }
          title={t("content.redirectStopRedirecting")}
          description={t("content.redirectStopBody")}
          confirmLabel={t("content.redirectStopRedirecting")}
          confirmStartIcon={<StopRoundedIcon />}
          confirmDataCy="StopRedirectContentItemConfirmButton"
        />
      )}
    </>
  );
};

export const ContentRedirectsSkeleton = () => {
  return (
    <Box display="flex" flexDirection="column" gap={1.75} mt={2}>
      <Skeleton variant="rounded" height={38} width={224} />
      <Skeleton variant="rounded" height={24} width={422} />
      <Box display="flex" flexDirection="column" gap={1}>
        <Skeleton variant="rounded" height={12} width={600} />
        <Skeleton variant="rounded" height={12} width={600} />
      </Box>
      <Skeleton variant="rounded" height={38} width={204} />
    </Box>
  );
};

export default ContentRedirects;
