import { Box, Stack } from "@mui/material";
import { WarningRounded } from "@mui/icons-material";
import React from "react";

type NoticeProps = {
  className?: string;
  children: React.ReactNode;
};
export const Notice = ({ className, children }: NoticeProps) => {
  return (
    <Stack
      direction="row"
      className={className}
      sx={{
        p: 1,
        gap: 1,
        alignItems: "center",
        border: 1,
        borderColor: "border",
        bgcolor: "#fffde2",
        color: "text.secondary",
      }}
    >
      <WarningRounded />
      <>{children}</>
    </Stack>
  );
};
