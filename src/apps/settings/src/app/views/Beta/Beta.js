import { useEffect, useState } from "react";
import cx from "classnames";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";

import Divider from "@mui/material/Divider";

import Cookies from "js-cookie";

import styles from "./Beta.less";

export default function Beta(props) {
  // v2 = ga = 0-899
  // v1 = beta = 900-999

  // ga = 0
  // beta = 999

  const [cookieVal, setCookieVal] = useState(Cookies.get("GOOGAPPUID"));

  console.log("cookie", cookieVal);

  return (
    <div className={styles.Robots}>
      <h1 className={styles.subheadline}>
        <FontAwesomeIcon icon={faFile} className={styles.titleIcon} />
        Beta Settings
      </h1>
      <Divider
        sx={{
          my: 1,
          mx: 2,
        }}
      />

      <div className={styles.Row}>
        <ToggleButtonGroup
          color="secondary"
          size="small"
          value={Number(cookieVal)}
          exclusive
          onChange={(_, val) => {
            console.log("toggle value", val);

            Cookies.set("GOOGAPPUID", val, {
              path: "/",
              domain: CONFIG.COOKIE_DOMAIN,
            });

            setCookieVal(val);
          }}
        >
          <ToggleButton value={0}>No</ToggleButton>
          <ToggleButton value={999}>Yes</ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
}
