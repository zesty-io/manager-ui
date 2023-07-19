import { FC } from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import { getTheme } from "@zesty-io/material";
import zestyLogo from "../../../public/images/zestyLogo.svg";

export const Staging: FC = (props) => {
  const theme = getTheme();

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundColor: "grey.900",
        }}
      >
        {props.children}
        <Box
          component="img"
          src={zestyLogo}
          position="fixed"
          top="32px"
          left="32px"
        ></Box>
      </Box>
    </ThemeProvider>
  );
};
