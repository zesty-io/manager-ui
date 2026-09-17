import { Tooltip, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

const CHIP_CONFIG = {
  scheduled: {
    actionKey: "shell.relationalVersionActionScheduled",
    color: "warning",
  },
  published: {
    actionKey: "shell.relationalVersionActionPublished",
    color: "success",
  },
  draft: {
    actionKey: "shell.relationalVersionActionSaved",
    color: "info",
  },
} as const;

type VersionChipProps = {
  type: "scheduled" | "draft" | "published";
  version: number;
  dateTime: string;
  publisher: string;
};
export const VersionChip = ({
  type,
  version,
  dateTime,
  publisher,
}: VersionChipProps) => {
  const { t, i18n } = useTranslation();
  return (
    <Tooltip
      placement="bottom-start"
      enterDelay={1000}
      enterNextDelay={1000}
      PopperProps={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -8],
            },
          },
        ],
      }}
      title={
        <div>
          {t("shell.relationalVersionTooltip", {
            version,
            action: t(CHIP_CONFIG[type]?.actionKey),
            date: new Date(dateTime).toLocaleDateString(i18n.language, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              timeZoneName: "short",
            }),
            publisher,
          })}
        </div>
      }
      slotProps={{
        popper: {
          style: {
            width: 160,
          },
        },
      }}
    >
      <Chip
        label={`v${version}`}
        size="small"
        color={CHIP_CONFIG[type]?.color}
        sx={{
          height: 20,
        }}
      />
    </Tooltip>
  );
};
