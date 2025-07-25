import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { TextField, Typography, Stack } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";

import { Notice } from "@zesty-io/core/Notice";
import { notify } from "shell/store/notifications";

import { updateSiteFont, deleteSiteFont } from "shell/store/settings";

import styles from "./Fonts.less";
import { TopBar } from "../../components/TopBar";
import { Box } from "@mui/material";
import { MainWrapper } from "../../components/Containers";
import LoadingButton from "@mui/lab/LoadingButton";
import { DeleteRounded } from "@mui/icons-material";
import SearchBox from "../../../../../../shell/components/SearchBox";

export default connect((state) => {
  return {
    fontsInstalled: state.settings.fontsInstalled,
  };
})(function Installed(props) {
  const [defaultFonts, setDefaultFonts] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [search, setSearch] = useState("");
  const [showOpenRemoveFontDialog, setShowOpenRemoveFontDialog] =
    useState(false);
  const [activeFont, setActiveFont] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const arrFonts = props.fontsInstalled.map((tag) => {
      const url = tag.attributes.href;
      return {
        ZUID: tag.ZUID,
        href: tag.attributes.href,
        font: url.split("=")[1].split(":")[0].replace("+", " "),
        variants: url.split("=")[1].split(":")[1]
          ? url
              .split("=")[1]
              .split(":")[1]
              .split(",")
              .map((variant) => ({ label: variant, value: "1" }))
          : [],
      };
    });

    setFonts(arrFonts);
    setDefaultFonts(arrFonts);

    props.fontsInstalled.forEach((tag) => {
      const style = document.createElement("style");
      const att = document.createAttribute("id");
      att.value = "googlefont";
      style.setAttributeNode(att);
      const css = `@import url('${tag.attributes.href}');`;
      style.append(css);

      document.head.appendChild(style);
    });
  }, [props.fontsInstalled]);

  function parseVariant(variant) {
    if (variant.split("").includes("i")) {
      const arrVariant = variant.split("");
      arrVariant.pop();
      return arrVariant.join("") + " Italic";
    }
    return variant === "400" ? "Regular" : variant;
  }

  function parseFontStyle(variant) {
    if (variant.split("").includes("i")) {
      return "italic";
    }
    return "";
  }

  function parseWeight(variant) {
    if (variant.split("").includes("i")) {
      const arrVariant = variant.split("");
      arrVariant.pop();
      return arrVariant.join("");
    }
    return variant;
  }

  function onSearch(value) {
    setSearch(value);
    const fontFounded = defaultFonts.filter((font) =>
      font.font.toLowerCase()?.includes(value.toLowerCase())
    );
    setFonts(fontFounded);
  }

  async function uninstallFont(font) {
    setIsUpdating(true);
    const fontToUpdate = fonts.find((f) => f.font === font);
    const updateVariants = fontToUpdate.variants
      .filter((variant) => variant.value === "1")
      .map((variant) => variant.label)
      .join();

    let request;

    if (updateVariants.length) {
      request = updateSiteFont(
        fontToUpdate.ZUID,
        `${fontToUpdate.href.split(":")[0]}${
          fontToUpdate.href.split(":")[1]
        }:${updateVariants}`
      );
    } else {
      request = deleteSiteFont(fontToUpdate.ZUID);
    }

    Promise.resolve(request)
      .then((res) => {
        props.dispatch(
          notify({
            kind: "success",
            message: "Font has been removed",
          })
        );
      })
      .catch((err) => {
        props.dispatch(
          notify({
            kind: "error",
            message: err.message,
          })
        );
      })
      .finally(() => {
        setShowOpenRemoveFontDialog(false);
        setIsUpdating(false);
      });
  }

  function toggleEnableFont(variant, value, font) {
    const copyFonts = fonts
      .map((f) => {
        if (f.font === font) {
          const pos = f.variants.map((v) => v.label).indexOf(variant);
          // handle broken installed fonts with no variants
          if (pos !== -1) {
            f.variants[pos].value = value.toString();
          }
          f.variants = f.variants.filter((variant) => variant.value === "1");
        }
        return f;
      })
      .filter(
        (f) => f.variants.filter((variant) => variant.value === "1").length
      );
    setFonts(copyFonts);
    uninstallFont(font);
  }

  function renderFontsList() {
    return (
      <div className={styles.ContainerListsFonts}>
        {fonts.map((font, index) => (
          <div key={index} className={styles.ListFontItem}>
            <header className={styles.FontHeader}>
              <div>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight={700}
                >
                  {font.font}
                </Typography>
              </div>
            </header>
            {font.variants.length === 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  className={styles.ParagraphFontInstalled}
                  color="text.secondary"
                  sx={{
                    fontFamily: `"${font.font.replace("+", " ")}"`,
                  }}
                >
                  All their equipment and instruments are alive.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setShowOpenRemoveFontDialog(true);
                    setActiveFont(font);
                    setActiveVariant(null);
                  }}
                  startIcon={<DeleteIcon />}
                  sx={{
                    alignSelf: "flex-start",
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
            {font.variants.map((variant, idx) => (
              <div
                key={idx}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className={styles.ParagraphFontInstalled}
                  sx={{
                    fontFamily: `"${font.font.replace("+", " ")}"`,
                    fontWeight: parseWeight(variant.label),
                    fontStyle: parseFontStyle(variant.label),
                  }}
                >
                  All their equipment and instruments are alive.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  id="RemoveFont"
                  onClick={() => {
                    setShowOpenRemoveFontDialog(true);
                    setActiveFont(font);
                    setActiveVariant(variant);
                  }}
                  startIcon={<DeleteIcon />}
                  sx={{
                    alignSelf: "flex-start",
                  }}
                >
                  Remove {parseVariant(variant.label)}
                </Button>
              </div>
            ))}
          </div>
        ))}
        {fonts.length === 0 && (
          <Notice>
            {search.length === 0 ? (
              <p>No fonts installed</p>
            ) : (
              <p>No matching fonts found</p>
            )}
          </Notice>
        )}
      </div>
    );
  }

  return (
    <>
      <TopBar title="Installed Fonts">
        <SearchBox
          placeholder="Search font"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          onChange={(evt) => {
            const term = evt.target.value;
            onSearch(term);
          }}
          value={search}
          sx={{
            width: 260,
          }}
        />
      </TopBar>
      <Box
        px="32px"
        py="16px"
        sx={{
          width: "100%",
          height: "calc(100% - 84px)",
          overflowY: "auto",
          overflowX: "hidden",
          margin: "0",
          display: "block",
          maxHeight: "calc(100% - 84px)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <MainWrapper rowGap={3} fullWidth>
          {renderFontsList()}
        </MainWrapper>
      </Box>
      <Dialog
        open={showOpenRemoveFontDialog}
        onClose={() => setShowOpenRemoveFontDialog(false)}
        fullWidth
        maxWidth={"xs"}
      >
        <DialogTitle>
          <Box
            sx={{
              backgroundColor: "red.100",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <DeleteRounded color="error" />
          </Box>
          <Stack
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            columnGap={1}
            overflow="hidden"
            textOverflow="ellipsis"
          >
            <Typography
              variant="inherit"
              fontWeight={700}
              flexGrow={0}
              flexShrink={0}
            >
              Remove Font
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Do you really want to uninstall this font?
          </Typography>
        </DialogTitle>

        <DialogActions>
          <Button
            onClick={() => setShowOpenRemoveFontDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={isUpdating}
            onClick={() => {
              toggleEnableFont(activeVariant?.label, "0", activeFont?.font);
            }}
          >
            Remove
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
});
