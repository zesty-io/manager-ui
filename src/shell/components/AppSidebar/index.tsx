import { FC, useMemo } from "react";
import { Box, Stack, Typography, PaletteMode } from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { getTheme } from "@zesty-io/material";

interface Props {
  mode?: PaletteMode;
  HeaderSubComponent?: React.ReactNode;
  headerTitle?: string;
}
export const AppSideBar: FC<Readonly<Props>> = ({
  mode = "light",
  HeaderSubComponent,
  headerTitle,
  children,
  ...props
}) => {
  const theme = useMemo(() => {
    return getTheme(mode);
  }, [mode]);

  const isLightMode = mode === "light";

  return (
    <ThemeProvider theme={theme}>
      <Stack
        sx={{
          backgroundColor: isLightMode ? "common.white" : "grey.900",
          height: "inherit",
        }}
        {...props}
      >
        <Box py={1.5}>
          {!!headerTitle && (
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={700}
              lineHeight="24px"
              fontSize={18}
              px={1.5}
            >
              {headerTitle}
            </Typography>
          )}
          {!!HeaderSubComponent && <Box>{HeaderSubComponent}</Box>}
        </Box>
        <Box
          height="100%"
          sx={{
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Stack>
    </ThemeProvider>
  );
};
