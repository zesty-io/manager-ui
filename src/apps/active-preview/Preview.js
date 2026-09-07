import { Suspense, useEffect, useRef, useState } from "react";
import i18n from "./i18n";
import { toSupportedLocale } from "shell/i18n";
import { useTranslation } from "react-i18next";
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
  SvgIcon,
} from "@mui/material";
import {
  LinkRounded,
  RefreshRounded,
  PhoneIphoneRounded,
  OpenInNewRounded,
  CloseRounded,
  CheckRounded,
  SaveRounded,
  ZoomInRounded,
  DangerousRounded,
} from "@mui/icons-material";
import { useLocalStorage } from "react-use";

// import { Meta } from "./components/Meta";
import { JSONPreview } from "./components/JSONPreview";
import { Frame, getTemplates } from "./components/Frame";

import api from "./api";

import styles from "./Preview.less";

const zoomLevels = [
  {
    label: "35%",
    value: 0.35,
  },
  {
    label: "50%",
    value: 0.5,
  },
  {
    label: "75%",
    value: 0.75,
  },
  {
    label: "100%",
    value: 1,
  },
  {
    label: "125%",
    value: 1.25,
  },
  {
    label: "150%",
    value: 1.5,
  },
];

function isInIframe() {
  return window.self !== window.top;
}

export function Preview(props) {
  return (
    <Suspense
      fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
    >
      <PreviewInner {...props} />
    </Suspense>
  );
}

function PreviewInner(props) {
  const { t } = useTranslation("activePreview");
  const templates = getTemplates(t);
  const ZUID = window.location.host.split(".")[0];
  if (!ZUID) {
    throw new Error("Invalid host for active preview");
  }

  const input = useRef();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  // const [open, setOpen] = useState(false);

  const [rotate, setRotate] = useState(false);
  const [settings, setSettings] = useState([]);
  const [domain, setDomain] = useState(props.domain || "");
  const [route, setRoute] = useState(props.route || "");
  const [device, setDevice] = useState("fullscreen");
  const [refresh, setRefresh] = useState(Date.now());
  const [version, setVersion] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scaleAnchorEl, setScaleAnchorEl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useLocalStorage("zoom", () => {
    return isInIframe() ? 0.35 : 1;
  });
  const [hasErrors, setHasErrors] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [domainError, serDomainError] = useState(false);

  const isBlockItem = route?.startsWith("/-/block/");

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
        if (msg.data.locale) {
          // Preload before switching so changeLanguage is always a cache-hit
          // and never triggers a re-suspend that would reset component state.
          const safeLocale = toSupportedLocale(msg.data.locale);
          i18n
            .loadLanguages(safeLocale)
            .then(() => i18n.changeLanguage(safeLocale));
        }
        if (msg.data.previewUrl) {
          setPreviewUrl(msg.data.previewUrl);
        }
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
        if (Object(msg.data).hasOwnProperty("hasErrors")) {
          setHasErrors(msg.data.hasErrors);
        }
      }
    }

    window.addEventListener("message", receiveMessage);
    window.parent.postMessage(
      { source: "zesty", action: "ready" },
      window.location.origin
    );
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      api(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}`).then((json) => {
        setDomain(
          !json?.data?.randomHashID
            ? "error"
            : `${CONFIG.URL_PREVIEW_PROTOCOL}${json.data.randomHashID}${CONFIG.URL_PREVIEW}`
        );
        setAuthenticated(true);
        serDomainError(false);
      });
    } catch (error) {
      if (error.message === "unauthenticated") {
        setAuthenticated(false);
      }
      setDomain("");
      serDomainError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = (action) => {
    window.parent.postMessage({
      source: "zesty",
      action,
    });
  };

  const selectTemplate = (template) => {
    if (template === "fullscreen") {
      setZoom(0.35);
    } else {
      setZoom(1);
    }
    setDevice(template);
    setAnchorEl(null);
  };

  const handleOpenInNewTab = () => {
    const newTab = window.open(previewUrl, "_blank");

    if (newTab) {
      newTab.addEventListener("load", () => {
        newTab.postMessage(
          {
            source: "zesty",
            previewUrl,
            route,
            settings,
            version,
            dirty,
          },
          window.location.origin
        );
      });
    }
  };

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
          {t("activePreview.saving")}
        </Typography>
      </Box>
    );
  }

  if ((!!domainError || !authenticated) && !loading) {
    return (
      <div className={styles.NoDomain}>
        <h1 className={styles.headline}>
          {!authenticated
            ? t("activePreview.sessionNotActive")
            : t("activePreview.disconnectedFromPreviewDomain")}
        </h1>
      </div>
    );
  }

  return (
    <>
      <Box bgcolor="grey.100" display="flex" alignItems="center" p={1}>
        {!isBlockItem ? (
          <>
            <IconButton
              size="small"
              onClick={() => handleCopyClick(`${domain}${route}`)}
              mr={0.25}
            >
              {isCopied ? <CheckRounded /> : <LinkRounded />}
            </IconButton>
            <Link
              href={`${domain}${route}`}
              target="_blank"
              noWrap
              sx={{
                direction: "rtl",
                display: "block",
                flex: "1",
                textAlign: "left",
              }}
            >
              {`${domain}${route}`}
            </Link>
          </>
        ) : (
          <Box flex={1}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ textTransform: "capitalize" }}
            >
              {t("common.preview")}
            </Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={() => setRefresh(Date.now())}
          sx={{
            ml: 1,
            mr: 0.5,
          }}
        >
          <RefreshRounded />
        </IconButton>
        {isBlockItem && (
          <IconButton
            size="small"
            onClick={() => handleCopyClick(`${domain}${route}`)}
            mr={0.25}
          >
            {isCopied ? <CheckRounded /> : <LinkRounded />}
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={(event) => setScaleAnchorEl(event.currentTarget)}
          sx={{
            mr: 0.5,
          }}
        >
          <ZoomInRounded />
        </IconButton>
        <Menu
          anchorEl={scaleAnchorEl}
          open={Boolean(scaleAnchorEl)}
          onClose={() => setScaleAnchorEl(null)}
          PaperProps={{
            sx: {
              width: 184,
            },
          }}
        >
          {zoomLevels.map((level, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                setZoom(level.value);
                setScaleAnchorEl(null);
              }}
              selected={zoom === level.value}
            >
              {level.label}
            </MenuItem>
          ))}
        </Menu>
        <IconButton
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            mr: 0.5,
          }}
        >
          <PhoneIphoneRounded />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              width: 320,
            },
          }}
        >
          <MenuItem
            selected={device === "fullscreen"}
            onClick={() => selectTemplate("fullscreen")}
          >
            {t("activePreview.noDevice")}
          </MenuItem>
          {Object.keys(templates)
            .slice(1)
            .map((template, index) => (
              <MenuItem
                key={index}
                onClick={(evt) => selectTemplate(template)}
                selected={template === device}
              >
                {templates[template].option}
              </MenuItem>
            ))}
          <FormControlLabel
            value="start"
            control={
              <Switch
                color="primary"
                checked={rotate}
                onChange={(event) => setRotate(event.target.checked)}
              />
            }
            label={t("activePreview.landscapeMode")}
            labelPlacement="start"
            sx={{
              mt: 2,
              flexDirection: "row-reverse", // Reverse the direction
              justifyContent: "space-between", // Optional, but this ensures the label takes up the full width and the checkbox is at the far right
              width: "92%",
            }}
          />
        </Menu>
        <IconButton
          sx={{
            mr: 0.5,
          }}
          size="small"
          onClick={handleOpenInNewTab}
        >
          <OpenInNewRounded />
        </IconButton>
        {!isBlockItem && (
          <IconButton size="small" onClick={() => sendMessage("close")}>
            <CloseRounded />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          height: "calc(100% - 48px)",
          overflow: device === "fullscreen" ? "unset" : "auto",

          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {dirty && (
          <Dialog
            disableAutoFocus
            open
            PaperProps={{
              sx: {
                p: 2.5,
                alignItems: "center",
                gap: 1.5,
                width: 240,
                boxSizing: "border-box",
              },
            }}
          >
            <Box
              sx={{
                backgroundColor: hasErrors ? "red.100" : "deepOrange.50",
                borderRadius: "100%",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SvgIcon
                component={hasErrors ? DangerousRounded : SaveRounded}
                color={hasErrors ? "error" : "primary"}
                sx={{
                  width: "24px",
                  height: "24px",
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight={700} align="center">
              {hasErrors
                ? t("activePreview.resolveInvalidFields")
                : t("activePreview.saveToUpdatePreview")}
            </Typography>
            {!hasErrors && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSaving(true);
                  sendMessage("save");
                }}
              >
                {t("common.save")}
              </Button>
            )}
          </Dialog>
        )}
        {settings && domain && route && route?.includes(".json") ? (
          <JSONPreview src={`${domain}${route}`} settings={settings} />
        ) : (
          <Frame
            isLoading={loading}
            key={`${route}-${refresh}`}
            device={device}
            domain={domain}
            route={route}
            rotate={rotate}
            blur={initialVersion === version && dirty}
            zoom={zoom}
          />
        )}
      </Box>
    </>
  );
}
