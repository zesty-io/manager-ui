import { memo, useEffect, useState } from "react";
import { connect } from "react-redux";
import { alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import {
  login,
  verifyTwoFactor,
  pollTwoFactor,
  verify,
} from "shell/store/auth";
import {
  Alert,
  Box,
  Divider,
  Paper,
  Typography,
  InputLabel,
  InputAdornment,
  IconButton,
  TextField,
} from "@mui/material";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import PasswordRoundedIcon from "@mui/icons-material/PasswordRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { LoadingButton } from "@mui/lab";
import { SSOButton, SSOButtonGroup } from "@zesty-io/material";

export default connect((state) => {
  return {
    auth: state.auth,
    user: state.user,
  };
})(
  memo(function Login(props) {
    const [loading, setLoading] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (evt) => {
      evt.preventDefault();
      setLoading(true);

      props
        .dispatch(login(evt.target.email.value, evt.target.password.value))
        .then((res) => {
          if (res.status === 202) {
            setTwoFactor(true);
            setError("");

            // Start polling for one-touch acceptance
            props.dispatch(pollTwoFactor());
          } else if (res.status !== 200) {
            setError(res.message);
          }
        })
        .catch((err) => {
          setError("There was a problem signing you in");
        })
        .finally(() => setLoading(false));
    };

    const handleTwoFactor = (evt) => {
      evt.preventDefault();
      setLoading(true);

      props
        .dispatch(verifyTwoFactor(evt.target.token.value))
        .then((res) => {
          setError(res.message);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setLoading(false));
    };

    useEffect(() => {
      if (isAuthenticated) {
        props.dispatch(verify());
      }
    }, [isAuthenticated]);

    return (
      <Paper
        elevation={0}
        sx={{
          boxSizing: "border-box",
          width: "400px",
          p: 4,
          borderRadius: "8px",
        }}
      >
        {twoFactor ? (
          <Box display="flex" flexDirection="column" gap={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={600} sx={{ mb: "2px" }}>
                Enter Your 2FA OTP
              </Typography>
              <Typography
                variant="body3"
                color="text.secondary"
                component="div"
              >
                You will receive this code on your phone.
              </Typography>
            </Box>
            {!!error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  "&.MuiAlert-standardError": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.error.main, 0.1),
                  },
                  "& .MuiAlert-icon": {
                    color: "error.main",
                  },
                }}
              >
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleTwoFactor}>
              <InputLabel>Code</InputLabel>
              <TextField
                name="token"
                type="text"
                placeholder="XXXXXXX"
                fullWidth
                error={!!error}
                autoComplete="off"
              />
              <LoadingButton
                size="large"
                type="submit"
                startIcon={<LoginRoundedIcon />}
                variant="contained"
                fullWidth
                sx={{ mt: 2.5 }}
                loading={loading}
              >
                Continue
              </LoadingButton>
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={600} sx={{ mb: "2px" }}>
                Hi, Welcome Back!
              </Typography>
              <Typography
                variant="body3"
                color="text.secondary"
                component="div"
              >
                Start empowering the world with content again
              </Typography>
            </Box>
            <SSOButtonGroup
              authServiceUrl={CONFIG.SERVICE_AUTH}
              onSuccess={() => {
                setIsAuthenticated(true);
              }}
              onError={(err) => {
                setError(err);
              }}
            >
              <SSOButton service="google" />
              <SSOButton service="azure" />
              <SSOButton service="github" />
            </SSOButtonGroup>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={4}
            >
              <Divider sx={{ flex: "1", borderColor: "border" }} />
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
              <Divider sx={{ flex: "1", borderColor: "border" }} />
            </Box>
            {!!error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  "&.MuiAlert-standardError": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.error.main, 0.1),
                  },
                  "& .MuiAlert-icon": {
                    color: "error.main",
                  },
                }}
              >
                {error}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleLogin}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <Box>
                <InputLabel>Email Address</InputLabel>
                <TextField
                  name="email"
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AlternateEmailRoundedIcon
                          sx={{ width: "20px", height: "20px" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  autoFocus
                  fullWidth
                  autoComplete="on"
                  error={!!error}
                />
              </Box>
              <Box>
                <InputLabel>Password</InputLabel>
                <TextField
                  type={showPassword ? "text" : "password"}
                  name="password"
                  sx={{ mb: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordRoundedIcon
                          sx={{ width: "20px", height: "20px" }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon
                              sx={{ width: "20px", height: "20px" }}
                            />
                          ) : (
                            <VisibilityRoundedIcon
                              sx={{ width: "20px", height: "20px" }}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  autoComplete="on"
                  error={!!error}
                />
                <Link
                  variant="caption"
                  href="https://www.zesty.io/login/forgot-password/"
                  target="_blank"
                >
                  Forgot Password?
                </Link>
              </Box>
              <LoadingButton
                size="large"
                type="submit"
                startIcon={<LoginRoundedIcon />}
                variant="contained"
                loading={loading}
              >
                Resume Session
              </LoadingButton>
            </Box>
          </Box>
        )}
      </Paper>
    );
  })
);
