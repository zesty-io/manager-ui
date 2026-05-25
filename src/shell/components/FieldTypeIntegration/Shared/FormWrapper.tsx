import { Paper } from "@mui/material";
import { ReactNode } from "react";

export type FormWrapperProps = {
  width: string | number;
  height: string | number;
  children: ReactNode;
};

export const FormWrapper = ({ width, height, children }: FormWrapperProps) => {
  return (
    <Paper
      sx={{
        width: width,
        height: height,
        maxHeight: "calc(100vh - 40px)",
        borderRadius: 2,
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
      }}
    >
      {children}
    </Paper>
  );
};
