import { Stack, Box, Typography, Button, ThemeProvider } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { theme } from "@zesty-io/material";

import notFound from "../../../../public/images/notFoundTransparent.png";

export default () => {
  return (
    <ThemeProvider theme={theme}>
      <Stack
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          component="img"
          src={notFound}
          alt="Not Found"
          width={320}
          height={320}
          mb={8}
        />
        <Typography variant="h4" fontWeight={600} mb={1} color="text.primary">
          Oops, something went wrong
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          This error has been sent to our team. Please reload our application to
          continue.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => window.location.reload()}
        >
          Reload Application
        </Button>
      </Stack>
    </ThemeProvider>
  );
};
