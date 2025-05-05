import { Typography, Stack, Box, Button } from "@mui/material";
import { GridViewRounded, PeopleRounded } from "@mui/icons-material";
import restricted from "../../../../public/images/restricted.png";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { logout } from "../../store/auth";

export const NoInstancePermission = () => {
  const dispatch = useDispatch();
  // FIXME: This is always undefined since we don't have the logged in user details if they log in and have no instance permission.
  const user = useSelector((state: AppState) => state.user);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mx={13}
      height="100vh"
    >
      <Box sx={{ maxWidth: 540 }}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your account does not have permission to access this instance. Please
          contact the instance owner or administrator to be added.
          <br />
          <br />
          If you believe you should have access, ensure you're using the correct
          account.
          <strong> Currently logged in as {user?.email}</strong> — try switching
          to another account.
        </Typography>
        <Stack direction="row" gap={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GridViewRounded />}
            // @ts-expect-error
            href={`${CONFIG.URL_ACCOUNTS}/instances`}
          >
            View Your Instances
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PeopleRounded />}
            onClick={() => {
              dispatch(logout());
            }}
          >
            Switch Account
          </Button>
        </Stack>
      </Box>
      <Box
        component="img"
        src={restricted}
        alt="No Permission"
        loading="lazy"
        sx={{
          maxWidth: 320,
        }}
      />
    </Stack>
  );
};
