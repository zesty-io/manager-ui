import { memo, useState } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import zestyLogo from "../../../../public/images/zestyLogo.svg";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { ThemeProvider } from "@mui/system";
import { FieldTypeText, theme } from "@zesty-io/material";
import { Notice } from "@zesty-io/core/Notice";

import { login, verifyTwoFactor, pollTwoFactor } from "shell/store/auth";
import { notify } from "shell/store/notifications";

import styles from "./Login.less";
import { useSSO } from "../../hooks/useSSO";
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
import googleIcon from "../../../../public/images/googleIcon.svg";
import microsoftIcon from "../../../../public/images/microsoftIcon.svg";
import githubIcon from "../../../../public/images/githubIcon.svg";
import { LoadingButton } from "@mui/lab";

const ssoOptions = [
  {
    service: "google",
    name: "Google",
    icon: googleIcon,
  },
  {
    service: "azure",
    name: "Microsoft",
    icon: microsoftIcon,
  },
  {
    service: "github",
    name: "Github",
    icon: githubIcon,
  },
];

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
    const [initiate, token] = useSSO();
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

    return (
      <ThemeProvider theme={theme}>
        <Box
          width="100vw"
          height="100vh"
          backgroundColor="grey.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
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
                {ssoOptions.map((option) => (
                  <Button
                    key={option.service}
                    size="large"
                    variant="outlined"
                    color="inherit"
                    onClick={() => initiate(option.service)}
                    startIcon={<img src={option.icon} />}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    Continue with {option.name}
                  </Button>
                ))}
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
        </Box>
        <Box
          component="img"
          src={zestyLogo}
          position="fixed"
          top="32px"
          left="32px"
        ></Box>
      </ThemeProvider>
    );

    return (
      <Modal
        className={styles.Login}
        open={!props.auth.valid || props.auth.checking}
      >
        <ModalContent>
          <div>
            <img
              src="https://brand.zesty.io/zesty-io-logo.svg"
              alt="Zesty.io Logo"
              width="40px"
            />
          </div>

          {twoFactor ? (
            <form onSubmit={handleTwoFactor}>
              <h1 className={styles.display}>
                Two Factor Authentication Token
              </h1>

              <p className={cx(styles.bodyText, styles.message)}>
                Your account has{" "}
                <Link
                  underline="none"
                  color="secondary"
                  title="Authy Two Factor Authentication"
                  href="https://authy.com/what-is-2fa/"
                  target="_blank"
                >
                  Authy Two Factor Authentication
                </Link>{" "}
                enabled which requires entering a one time token in order to
                complete your login.
              </p>

              <label>
                <span>7 Digit Authy Token</span>
                <TextField
                  name="token"
                  type="text"
                  autoComplete="off"
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ mb: 2 }}
                  fullWidth
                />
              </label>

              <Button
                type="submit"
                variant="contained"
                startIcon={<CheckCircleOutlineIcon />}
              >
                Confirm Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <h1 className={styles.display}>Login to Continue</h1>

              <p className={cx(styles.bodyText, styles.message)}>
                Your session has expired and you need to login to access this
                instance.
              </p>

              <FieldTypeText
                tabIndex="1"
                type="email"
                name="email"
                label="Email"
                placeholder="e.g. hello@zesty.io"
                autoFocus
              />
              <FieldTypeText
                type="password"
                name="password"
                label="Password"
                tabIndex="2"
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size="20px" /> : <ExitToAppIcon />
                }
                sx={{ mt: 1 }}
              >
                Resume Session
              </Button>
              <Button onClick={() => initiate("google")}>Test</Button>
            </form>
          )}

          {error && <Notice className={styles.error}>{error}</Notice>}
        </ModalContent>
      </Modal>
    );
  })
);
