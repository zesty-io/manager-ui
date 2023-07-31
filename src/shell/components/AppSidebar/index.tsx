import {
  useMemo,
  forwardRef,
  PropsWithChildren,
  useRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  Stack,
  Typography,
  PaletteMode,
  ScopedCssBaseline,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme, theme } from "@zesty-io/material";

interface Props {
  mode?: PaletteMode;
  HeaderSubComponent?: React.ReactNode;
  headerTitle?: string;
}
export const AppSideBar = forwardRef<any, PropsWithChildren<Props>>(
  (
    { mode = "light", HeaderSubComponent, headerTitle, children, ...props },
    ref
  ) => {
    const childrenContainerRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(
      ref,
      () => {
        return {
          scrollDown() {
            const div = childrenContainerRef.current;
            div.scrollTop = div?.scrollHeight;
          },
        };
      },
      []
    );

    const themeMode = mode === "light" ? theme : darkTheme;

    return (
      <ThemeProvider theme={themeMode}>
        <ScopedCssBaseline
          component={Box}
          sx={{ height: "100%", width: "inherit" }}
        >
          <Stack
            sx={{
              backgroundColor: "background.paper",
              height: "100%",
              userSelect: "none",
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
              ref={childrenContainerRef}
              sx={{
                overflowY: "auto",
                scrollBehavior: "smooth",
              }}
            >
              {children}
            </Box>
          </Stack>
        </ScopedCssBaseline>
      </ThemeProvider>
    );
  }
);
