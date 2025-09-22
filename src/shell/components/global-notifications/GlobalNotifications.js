import { memo, useState, useEffect, useCallback, forwardRef } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";
import useOnclickOutside from "react-cool-onclickoutside";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import { AppLink } from "shell/components/AppLink";
import {
  Typography,
  Stack,
  Badge,
  IconButton,
  Alert,
  Drawer,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import styles from "./GlobalNotifications.less";

import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {
  SnackbarContent,
  SnackbarProvider,
  enqueueSnackbar,
  useSnackbar,
} from "notistack";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const alertDetails = {
  warn: {
    icon: <WarningRoundedIcon sx={{ width: 22, height: 22 }} />,
    severity: "warning",
  },
  error: {
    icon: <ErrorOutlineOutlinedIcon sx={{ width: 22, height: 22 }} />,
    severity: "error",
  },
  save: {
    icon: <CheckCircleRoundedIcon sx={{ width: 22, height: 22 }} />,
    severity: "success",
  },
  success: {
    icon: <CheckCircleRoundedIcon sx={{ width: 22, height: 22 }} />,
    severity: "success",
  },
  deleted: {
    icon: <DeleteRoundedIcon sx={{ width: 22, height: 22 }} />,
    severity: "success",
  },
  default: {
    icon: <InfoRoundedIcon sx={{ width: 22, height: 22 }} />,
    severity: "info",
  },
};

export default connect((state) => {
  return {
    notifications: state.notifications,
  };
})(
  memo(function GlobalNotifications(props) {
    const [initialRender, setInitialRender] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const ref = useOnclickOutside(() => {
      setDrawerOpen(false);
    });

    const kind = props.notifications[0]?.kind;
    const { icon, severity } =
      alertDetails[alertDetails.hasOwnProperty(kind) ? kind : "default"];

    useEffect(() => {
      if (!initialRender && props.notifications.length) {
        setShowToast(true);
        enqueueSnackbar(props.notifications[0].message, {
          variant: "custom",
          severity,
          icon,
          heading: props.notifications[0]?.heading,
        });
        // On every render set timeout to hide notices
        const token = setTimeout(() => {
          setShowToast(false);
        }, 5000);

        return () => {
          clearTimeout(token);
        };
      }

      // Avoid displaying logout notice on re-login
      setInitialRender(false);
    }, [props.notifications.length]);

    const msgIcon = (kind) => {
      let icon;

      switch (kind) {
        case "warn":
        case "error":
          icon = faExclamationTriangle;
          break;
        case "save":
        case "success":
          icon = faCheckCircle;
          break;
        default:
          icon = faBell;
          break;
      }

      return icon;
    };

    return (
      <SnackbarProvider
        autoHideDuration={4000}
        maxSnack={10}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        Components={{ custom: CustomNotification }}
      >
        <aside ref={ref} className={cx(styles.Notifications)}>
          <IconButton
            size="small"
            aria-label="See All Notifications"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <Badge
              invisible={!props.notifications.length}
              max={999}
              badgeContent={props.notifications.length}
              sx={{
                "& .MuiBadge-badge": {
                  left: "4px",
                },
                "& .MuiBadge-standard": {
                  backgroundColor: "deepOrange.100",
                  color: "primary.main",
                },
              }}
            >
              <NotificationsIcon fontSize="inherit" />
            </Badge>
          </IconButton>

          <Drawer
            open={drawerOpen}
            variant="persistent"
            anchor="right"
            onClose={() => setDrawerOpen(false)}
            hideBackdrop
            slotProps={{
              paper: {
                className: styles.Drawer,
                elevation: 16,

                sx: {
                  width: 450,
                  height: "calc(100vh - 40px)",
                  top: "unset",
                  bottom: 0,
                },
              },
            }}
          >
            <Box className={styles.DrawerContent}>
              <Box component="header">
                <Typography variant="h1">My Notifications</Typography>
                <AppLink to="/reports/audit-trail">View All Logs</AppLink>
              </Box>

              {!props.notifications.length && (
                <Typography variant="h2">No actions taken</Typography>
              )}

              <ul>
                {props.notifications.map((notice, i) => {
                  return (
                    <li
                      key={i}
                      className={cx(styles.Notification, styles.bodyText)}
                    >
                      <p className={styles.Message}>
                        <FontAwesomeIcon
                          className={cx(
                            notice.kind ? styles[notice.kind] : null,
                            styles.Icon
                          )}
                          icon={msgIcon(notice.kind)}
                        />
                        {notice.message}
                      </p>
                      {notice.epoch && (
                        <small className={cx(styles.Timestamp, styles.caption)}>
                          {moment(notice.epoch).fromNow()}
                        </small>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Box>
          </Drawer>
        </aside>
      </SnackbarProvider>
    );
  })
);

export const CustomNotification = forwardRef(({ id, ...props }, ref) => {
  const { closeSnackbar } = useSnackbar();

  const handleDismiss = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  const parseStrToBold = (str, isHeading = false) => {
    const styles = {
      variant: "body2",
      fontWeight: 700,
      component: "span",
    };
    if (str.indexOf(":") !== -1) {
      return (
        <>
          <Typography {...styles}>
            {str.substring(0, str.indexOf(":") + 1)}
          </Typography>
          {str.substring(str.indexOf(":") + 1)}
        </>
      );
    } else if (str.indexOf(":") === -1 && isHeading)
      return <Typography {...styles}>{str}</Typography>;
    else if (str.indexOf(":") === -1 && [undefined, ""].includes(props.heading))
      return <Typography {...styles}>{str}</Typography>;
    else return str;
  };

  const typograpySX = {
    maxWidth: "540px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // this will only show 1 or 2 lines to prevent exceeding on the expected height
    // depending what type of notification will be displayed.
    display: props.severity === "success" ? "block" : "-webkit-box",
    WebkitLineClamp: props.heading && props.message ? "1" : "2",
    WebkitBoxOrient: "vertical",
  };

  return (
    <SnackbarContent ref={ref}>
      {typeof props.message === "object" ? (
        ""
      ) : (
        <Alert
          data-cy="toast"
          key={id}
          variant="filled"
          severity={props.severity}
          icon={props.icon}
          action={
            <Stack direction="row">
              <IconButton onClick={handleDismiss}>
                <CloseIcon sx={{ width: 20, height: 20, color: "white" }} />
              </IconButton>
            </Stack>
          }
          sx={{
            width: 540,
            padding:
              !(props.heading && props.message) || props.severity === "success"
                ? "4px 8px"
                : "0px 8px",
          }}
        >
          <Stack>
            <Typography
              variant="body2"
              noWrap={props.severity === "success"}
              sx={{
                ...typograpySX,
              }}
            >
              {props.heading
                ? props.heading && parseStrToBold(props.heading, true)
                : props.message && parseStrToBold(props.message)}
            </Typography>

            {props.heading && (
              <Typography
                variant="body2"
                noWrap={props.severity === "success"}
                sx={{
                  ...typograpySX,
                }}
              >
                {parseStrToBold(props.message)}
              </Typography>
            )}
          </Stack>
        </Alert>
      )}
    </SnackbarContent>
  );
});
