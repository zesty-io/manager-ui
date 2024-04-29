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

import { Drawer, DrawerContent } from "@zesty-io/core/Drawer";
import { AppLink } from "@zesty-io/core/AppLink";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import NotificationsIcon from "@mui/icons-material/Notifications";

import styles from "./GlobalNotifications.less";
import { Alert, Button } from "@mui/material";

import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
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

const alertDetails = (kind) => {
  let bgColor, icon, severity;

  switch (kind) {
    case "warn":
      bgColor = "warning.main";
      icon = <WarningRoundedIcon sx={{ width: 22, height: 22 }} />;
      severity = "warning";
      break;
    case "error":
      bgColor = "error.dark";
      icon = <ErrorOutlineOutlinedIcon sx={{ width: 22, height: 22 }} />;
      severity = "error";
      break;
    case "save":
    case "success":
      bgColor = "success.dark";
      icon = <CheckCircleRoundedIcon sx={{ width: 22, height: 22 }} />;
      severity = "success";
      break;
    case "deleted":
      bgColor = "success.dark";
      icon = <DeleteRoundedIcon sx={{ width: 22, height: 22 }} />;
      severity = "success";
      break;
    default:
      bgColor = "info.main";
      icon = <InfoRoundedIcon sx={{ width: 22, height: 22 }} />;
      severity = "info";
      break;
  }

  return { bgColor, icon, severity };
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

    const { bgColor, icon, severity } = alertDetails(
      props.notifications[0]?.kind
    );

    useEffect(() => {
      if (!initialRender && props.notifications.length) {
        setShowToast(true);
        enqueueSnackbar(props.notifications[0].message, {
          variant: "custom",
          severity,
          icon,
          bgColor,
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
        autoHideDuration={8000}
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
            className={styles.Drawer}
            position="right"
            offset="0px"
            width="450px"
            height="calc(100vh - 40px)"
            open={drawerOpen}
          >
            <DrawerContent className={styles.DrawerContent}>
              <header>
                <h1 className={styles.display}>My Notifications</h1>
                <AppLink to="/reports/audit-trail">View All Logs</AppLink>
              </header>

              {!props.notifications.length && (
                <h2 className={styles.headline}>No actions taken</h2>
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
            </DrawerContent>
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

  return (
    <SnackbarContent ref={ref}>
      <Alert
        key={id}
        variant="filled"
        severity={props.severity}
        icon={props.icon}
        action={
          <Stack direction="row">
            {props.heading && <Button sx={{ color: "white" }}>Action</Button>}
            <IconButton onClick={handleDismiss}>
              <CloseIcon sx={{ width: 20, height: 20, color: "white" }} />
            </IconButton>
          </Stack>
        }
        sx={{
          "& .MuiAlert-icon, .MuiAlert-message, .MuiAlert-action ": {
            color: "#fff",
          },
          "& .MuiAlert-action": {
            alignItems: "center",
            padding: 0,
            pl: 2,
            mr: 0,
          },
          padding: "8px 12px",
          borderRadius: "8px",
          bgcolor: props.bgColor,
          width: 516,
        }}
      >
        <Stack>
          <Typography
            variant="body2"
            noWrap={props.severity === "success"}
            sx={{
              maxWidth: "516px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: props.heading ? 700 : "normal",
            }}
          >
            {props.heading ? props.heading : props.message}
          </Typography>

          {props.heading && (
            <Typography
              variant="body2"
              noWrap={props.severity === "success"}
              sx={{
                maxWidth: "516px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {props.message}
            </Typography>
          )}
        </Stack>
      </Alert>
    </SnackbarContent>
  );
});
