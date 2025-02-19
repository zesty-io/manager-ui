import { Tooltip, Chip } from "@mui/material";

const CHIP_CONFIG = {
  scheduled: {
    text: "scheduled to publish",
    color: "warning",
  },
  published: {
    text: "published",
    color: "success",
  },
  draft: {
    text: "saved",
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
          v{version} {CHIP_CONFIG[type]?.text} on <br />
          {new Date(dateTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          })}{" "}
          <br /> by {publisher}
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
