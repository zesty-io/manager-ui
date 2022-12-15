import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import cx from "classnames";

import { Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faImage,
  faAddressCard,
  faDatabase,
  faChartLine,
  faCog,
  faBullseye,
  faCode,
  faRocket,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default memo(function GlobalMenu() {
  const location = useLocation();
  const openNav = useSelector((state) => state.ui.openNav);
  const products = useSelector((state) => state.products);

  const slug = location.pathname.split("/")[1];
  const icons = {
    home: faHome,
    content: faEdit,
    media: faImage,
    schema: faDatabase,
    code: faCode,
    leads: faAddressCard,
    reports: faChartLine,
    seo: faBullseye,
    settings: faCog,
    release: faRocket,
  };

  return (
    <menu className={cx(styles.GlobalMenu, openNav ? null : styles.Closed)}>
      {products.map((product) => {
        // Covert dashes to spaces
        // Uppercase first letter of word
        let name = product
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

        if (product === "seo") {
          name = name.toUpperCase();
        }

        return (
          <Link
            key={product}
            className={cx(
              styles.SubAppLink,
              slug === product ? styles.current : null
            )}
            to={`/${product}`}
            title={`${name} App`}
          >
            <FontAwesomeIcon icon={icons[product]} />
            {openNav && (
              <Typography variant="body3" sx={{ color: "grey.500" }}>
                {name}
              </Typography>
            )}
          </Link>
        );
      })}
    </menu>
  );
});
