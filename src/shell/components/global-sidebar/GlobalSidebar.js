import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import styles from "./GlobalSidebar.less";

import { Box, CardMedia } from "@mui/material";
import GlobalMenu from "shell/components/global-menu";
import GlobalCustomApps from "shell/components/global-custom-apps";
import GlobalActions from "shell/components/global-actions";
import fullZestyLogo from "../../../../public/images/fullZestyLogo.svg";
import zestyLogo from "../../../../public/images/zestyLogo.svg";

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
    <aside className={styles.GlobalSidebar} style={globalSideBarThemeStyles}>
      <div>
        <Box sx={{ p: 2 }}>
          {props.openNav ? (
            <CardMedia
              component="img"
              data-src={fullZestyLogo}
              image={fullZestyLogo}
              sx={{
                width: "84.17px",
                height: "24px",
              }}
            />
          ) : (
            <CardMedia
              component="img"
              data-src={zestyLogo}
              image={zestyLogo}
              sx={{
                width: "24px",
                height: "24px",
              }}
            />
          )}
        </Box>
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
  );
});
