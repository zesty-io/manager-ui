import { useState } from "react";
import Cookies from "js-cookie";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";

import styles from "./Beta.less";
export default function Beta() {
  const [cookieVal, setCookieVal] = useState(Cookies.get("GOOGAPPUID") || 999);

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
        <FormLabel>
          <p>Activate Beta</p>
        </FormLabel>
        <Notice>
          By opting into the manager-ui beta you will recieve access to new
          features before they become GA(generally available). Beta changes are
          promoted to GA every 2 weeks.
        </Notice>
        <ToggleButtonGroup
          color="secondary"
          size="small"
          value={Number(cookieVal)}
          exclusive
          onChange={(_, val) => {
            // ga = 999
            // beta = 0

            Cookies.set("GOOGAPPUID", val, {
              path: "/",
              domain: CONFIG.COOKIE_DOMAIN,
            });

            setCookieVal(val);
          }}
        >
          <ToggleButton value={999}>No</ToggleButton>
          <ToggleButton value={0}>Yes</ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
}
