import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import styles from "./GlobalSidebar.less";

import { Box, ThemeProvider, IconButton } from "@mui/material";
import GlobalMenu from "shell/components/global-menu";
import GlobalCustomApps from "shell/components/global-custom-apps";
import GlobalActions from "shell/components/global-actions";
import fullZestyLogo from "../../../../public/images/fullZestyLogo.svg";
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { theme } from "@zesty-io/material";

const globalSideBarThemeStyles = {
  backgroundColor: theme.palette.grey[900],
};

export default connect((state) => {
  return {
    ui: state.ui,
    instance: state.instance,
  };
})(function GlobalSidebar(props) {
  return (
    <ThemeProvider theme={theme}>
      <aside className={styles.GlobalSidebar} style={globalSideBarThemeStyles}>
        <div>
          <Box sx={{ px: 2.5, pb: 0, pt: 2.5 }}>
            {props.openNav ? (
              <Box
                component="img"
                data-src={fullZestyLogo}
                src={fullZestyLogo}
                sx={{
                  width: "84.17px",
                  height: "24px",
                }}
              />
            ) : (
              <Box
                component="img"
                data-src={zestyLogo}
                src={zestyLogo}
                sx={{
                  width: "24px",
                  height: "24px",
                }}
              />
            )}
          </Box>
          <IconButton
            onClick={props.onClick}
            sx={{
              borderColor: "grey.600",
              borderStyle: "solid",
              borderWidth: "1px",
              backgroundColor: "grey.900",
              float: "right",
              mr: -2,
              zIndex: 50,
              width: "24px",
              height: "24px",

              "&:hover": {
                backgroundColor: "primary.main",
                borderColor: "common.white",

                ".MuiSvgIcon-root": {
                  color: "common.white",
                },
              },
            }}
          >
            {props.openNav ? (
              <KeyboardDoubleArrowLeftIcon
                fontSize="small"
                sx={{
                  color: "grey.600",
                }}
              />
            ) : (
              <KeyboardDoubleArrowRightIcon
                fontSize="small"
                sx={{ color: "grey.600" }}
              />
            )}
          </IconButton>
          <GlobalMenu openNav={props.ui.openNav} />
          <GlobalCustomApps openNav={props.ui.openNav} />
          <GlobalActions hash={props.instance.randomHashID} />
          {props.openNav ? (
            <p
              className={cx(styles.Collapse, styles.Open)}
              onClick={props.onClick}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Collapse</span>
            </p>
          ) : (
            <p className={styles.Collapse} onClick={props.onClick}>
              <FontAwesomeIcon icon={faChevronRight} />
            </p>
          )}
        </div>
      </aside>
    </ThemeProvider>
  );
});
