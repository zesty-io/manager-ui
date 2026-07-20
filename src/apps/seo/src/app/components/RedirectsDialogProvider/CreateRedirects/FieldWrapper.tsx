import { FC, ReactNode } from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

export type FieldWrapperProps = {
  label: string;
  tooltip?: string | ReactNode;
  disabledTooltip?: string | ReactNode;
  readOnly?: boolean;
  children: ReactNode;
};

export const FieldWrapper: FC<FieldWrapperProps> = ({
  label,
  tooltip,
  disabledTooltip,
  readOnly = false,
  children,
}: FieldWrapperProps) => {
  const withDisabledTooltip =
    !!disabledTooltip && readOnly ? (
      <Tooltip
        title={
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <NotInterestedIcon color="error" fontSize="small" />
            {disabledTooltip}
          </Box>
        }
        placement="top"
        followCursor
      >
        <Box width="100%">{children}</Box>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      rowGap="4px"
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        width="100%"
        gap="8px"
      >
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        {!!tooltip && (
          <Tooltip
            title={tooltip}
            placement="top-start"
            slotProps={{
              popper: {
                style: {
                  width: "fit-content",
                  maxWidth: "600px",
                },
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [-20, -10],
                    },
                  },
                ],
              },
            }}
          >
            <InfoIcon
              sx={{ width: "10px", height: "10px", color: "action.active" }}
            />
          </Tooltip>
        )}
      </Stack>
      {withDisabledTooltip}
    </Box>
  );
};
