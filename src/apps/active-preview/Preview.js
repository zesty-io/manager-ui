import { useEffect, useRef, useState } from "react";
import {
  Button,
  Link,
  MenuItem,
  Box,
  IconButton,
  Menu,
  FormControlLabel,
  Switch,
  Dialog,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  LinkRounded,
  RefreshRounded,
  PhoneIphoneRounded,
  OpenInNewRounded,
  CloseRounded,
  CheckRounded,
  SaveRounded,
} from "@mui/icons-material";

// import { Meta } from "./components/Meta";
import { JSONPreview } from "./components/JSONPreview";
import { Frame, templates } from "./components/Frame";

import api from "./api";

import styles from "./Preview.less";
export function Preview(props) {
  const ZUID = window.location.host.split(".")[0];
  if (!ZUID) {
    throw new Error("Invalid host for active preview");
  }

  const input = useRef();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  // const [open, setOpen] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [instance, setInstance] = useState({});
  const [settings, setSettings] = useState([]);
  const [domain, setDomain] = useState(props.domain);
  const [route, setRoute] = useState(props.route || "/");
  const [device, setDevice] = useState("fullscreen");
  const [refresh, setRefresh] = useState(Date.now());
  const [version, setVersion] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [saving, setSaving] = useState(false);

  // Track initial version sent. We use this to make a determination
  // on whether current content has changed or the different version was
  // picked for previewing
  const [initialVersion, setInitialVersion] = useState(props.version);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (data) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Listen for messages
  useEffect(() => {
    function receiveMessage(msg) {
      setSaving(false);
      // Prevent malicious communication to this window
      if (msg.origin !== window.location.origin) {
        return;
      }

      if (msg.data.source === "zesty") {
        if (msg.data.route) {
          setRoute(msg.data.route);
        }
        if (msg.data.settings) {
          setSettings(msg.data.settings);
        }
        if (msg.data.refresh) {
          setRefresh(Date.now());
        }
        if (Object(msg.data).hasOwnProperty("dirty")) {
          setDirty(msg.data.dirty);
        }
        if (msg.data.version) {
          setVersion(msg.data.version);
          if (!initialVersion) {
            setInitialVersion(msg.data.version);
          }
        }
      }
    }

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [domain]);

  // fetch domain
  useEffect(() => {
    api(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}`)
      .then((json) => {
        setInstance(json.data);
        setDomain(
          `${CONFIG.URL_PREVIEW_PROTOCOL}${json.data.randomHashID}${CONFIG.URL_PREVIEW}`
        );
      })
      .catch((err) => {
        if (err.message === "unauthenticated") {
          setAuthenticated(false);
          setDomain("");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const sendMessage = (action) => {
    window.parent.postMessage({
      source: "zesty",
      action,
    });
  };

  const selectTemplate = (template) => {
    setDevice(template);
    setAnchorEl(null);
  };

  if (!domain) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"column"}
      >
        <CircularProgress />
        <Typography variant="h5" fontWeight={600} mt={1.5}>
          Finding Domain
        </Typography>
      </Box>
    );
  }

  if (saving) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"column"}
      >
        <CircularProgress />
        <Typography variant="h5" fontWeight={600} mt={1.5}>
          Saving
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        bgcolor="grey.100"
        display="flex"
        gap={1}
        justifyContent="space-between"
        p={1}
        sx={{
          overflow: "auto",
        }}
      >
        <Box display="flex" gap={0.25} alignItems="center">
          <IconButton
            size="small"
            onClick={() => handleCopyClick(`${domain}${route}`)}
          >
            {isCopied ? <CheckRounded /> : <LinkRounded />}
          </IconButton>
          <Link
            href={`${domain}${route}`}
            target="_blank"
            noWrap
            sx={{
              direction: "rtl",
              maxWidth: "234px",
            }}
          >
            {`${domain}${route}`}
          </Link>
        </Box>
        <Box display="flex" gap={0.5} alignItems="center">
          <IconButton size="small" onClick={() => setRefresh(Date.now())}>
            <RefreshRounded />
          </IconButton>
          <IconButton
            size="small"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <PhoneIphoneRounded />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => selectTemplate("fullscreen")}>
              No Device
            </MenuItem>
            {Object.keys(templates)
              .slice(1)
              .map((template, index) => (
                <MenuItem
                  key={index}
                  onClick={(evt) => selectTemplate(template)}
                >
                  {templates[template].option}
                </MenuItem>
              ))}
            <FormControlLabel
              sx={{ mt: 2 }}
              value="start"
              control={
                <Switch
                  color="primary"
                  checked={rotate}
                  onChange={(event) => setRotate(event.target.checked)}
                />
              }
              label="Landscape Mode"
              labelPlacement="start"
            />
          </Menu>
          <IconButton
            size="small"
            onClick={() =>
              window.open(
                `${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`,
                "_blank"
              )
            }
          >
            <OpenInNewRounded />
          </IconButton>
          <IconButton size="small" onClick={() => sendMessage("close")}>
            <CloseRounded />
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          height: "calc(100% - 48px)",
          overflow: "auto",
        }}
      >
        {dirty && (
          <Dialog
            disableAutoFocus
            open
            PaperProps={{
              sx: {
                p: 2,
                alignItems: "center",
                gap: 1.5,
              },
            }}
          >
            <Box
              sx={{
                backgroundColor: "deepOrange.200",
                borderRadius: "100%",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SaveRounded
                color="primary"
                sx={{
                  width: "24px",
                  height: "24px",
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Save to Update Preview
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSaving(true);
                sendMessage("save");
              }}
              sx={{
                maxWidth: "54px",
              }}
            >
              Save
            </Button>
          </Dialog>
        )}

        {!loading && domain && route ? (
          route.includes(".json") ? (
            <JSONPreview src={`${domain}${route}`} settings={settings} />
          ) : (
            <Frame
              key={refresh}
              device={device}
              domain={domain}
              route={route}
              rotate={rotate}
              blur={initialVersion === version && dirty}
            />
          )
        ) : (
          <div className={styles.NoDomain}>
            <h1 className={styles.headline}>
              {!authenticated
                ? "Your session is not active. Please login to Zesty.io"
                : "Disconnected from preview domain"}
            </h1>
          </div>
        )}
      </Box>
    </>
  );
}
