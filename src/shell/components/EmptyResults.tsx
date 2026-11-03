import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { SxProps, Theme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { Trans, useTranslation } from "react-i18next";

import noSearchResults from "../../../public/images/noSearchResults.svg";

export type EmptyResultsProps = {
  variant: "search" | "filter";
  size?: "page" | "compact" | "dialog";
  query?: string;
  onAction?: () => void;
  actionLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
  };
  title?: ReactNode;
  description?: ReactNode;
  imageHeight?: number;
  dataCy?: string;
  sx?: SxProps<Theme>;
};

const SIZE_PRESETS: Record<
  NonNullable<EmptyResultsProps["size"]>,
  { maxWidth?: number; imageHeight: number }
> = {
  page: { maxWidth: 420, imageHeight: 200 },
  dialog: { maxWidth: 387, imageHeight: 140 },
  compact: { imageHeight: 64 },
};

export const EmptyResults = ({
  variant,
  size = "page",
  query = "",
  onAction,
  actionLabel,
  secondaryAction,
  title,
  description,
  imageHeight,
  dataCy,
  sx,
}: EmptyResultsProps) => {
  const { t } = useTranslation("shell", { useSuspense: false });
  const preset = SIZE_PRESETS[size];
  const actionDataCy = dataCy ?? "EmptyResults";

  const alt = t("shell.noSearchResultsAlt");

  if (size === "compact") {
    return (
      <Stack
        data-cy={dataCy}
        alignItems="center"
        sx={[
          { gap: 1.5, p: 1.5, textAlign: "center" },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <img
          src={noSearchResults}
          width={70}
          height={imageHeight ?? preset.imageHeight}
          alt={alt}
        />
        <Typography variant="body2" color="text.secondary" align="center">
          {title ?? t("shell.searchNoResults", { query })}
        </Typography>
        {onAction && (
          <Button
            data-cy={`${actionDataCy}Action`}
            variant="contained"
            onClick={onAction}
            startIcon={
              variant === "search" ? (
                <SearchRoundedIcon />
              ) : (
                <RestartAltRoundedIcon />
              )
            }
          >
            {actionLabel ??
              (variant === "search"
                ? t("common.searchAgain")
                : t("shell.resetFilters"))}
          </Button>
        )}
      </Stack>
    );
  }

  const defaultTitle =
    variant === "search" ? (
      <Trans
        i18nKey="shell.searchNoResultsRich"
        values={{ query }}
        components={{
          strong: (
            <Box
              component="strong"
              fontWeight="bold"
              sx={{ wordBreak: "break-word" }}
            />
          ),
        }}
      />
    ) : (
      t("shell.noFilterResults")
    );
  const defaultDescription =
    variant === "search"
      ? t("shell.searchNoResultsSuggestion")
      : t("shell.noFilterResultsSuggestion");
  const defaultActionLabel =
    variant === "search" ? t("common.searchAgain") : t("shell.resetFilters");
  const isPage = size === "page";

  return (
    <Stack
      data-cy={dataCy}
      alignItems="center"
      sx={[
        { maxWidth: preset.maxWidth, mx: "auto", textAlign: "center" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <img
        src={noSearchResults}
        height={imageHeight ?? preset.imageHeight}
        alt={alt}
      />
      <Typography
        variant={isPage ? "h4" : "h5"}
        fontWeight={600}
        color="text.primary"
        sx={isPage ? { pt: 4, pb: 1 } : { pt: 2, pb: 0.5 }}
      >
        {title ?? defaultTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ pb: 3 }}>
        {description ?? defaultDescription}
      </Typography>
      {(secondaryAction || onAction) && (
        <Stack direction="row" justifyContent="center" sx={{ gap: 2 }}>
          {secondaryAction && (
            <Button
              data-cy={`${actionDataCy}SecondaryAction`}
              variant="contained"
              color="inherit"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              startIcon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
          {onAction && (
            <Button
              data-cy={`${actionDataCy}Action`}
              variant="contained"
              onClick={onAction}
              startIcon={
                variant === "search" ? (
                  <SearchRoundedIcon />
                ) : (
                  <RestartAltRoundedIcon />
                )
              }
            >
              {actionLabel ?? defaultActionLabel}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
};
