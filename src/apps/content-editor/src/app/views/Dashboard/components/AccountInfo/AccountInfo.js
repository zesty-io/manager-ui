import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEye,
  faUser,
  faGlobeAmericas,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";
// import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import PublicIcon from "@mui/icons-material/Public";

import styles from "./AccountInfo.less";
import { AppLink } from "@zesty-io/core/AppLink";
import { useDomain } from "shell/hooks/use-domain";

export function AccountInfo(props) {
  const [faviconURL, setFaviconURL] = useState("");
  const domain = useDomain();

  useEffect(() => {
    const tag = Object.values(props.headTags).find((tag) =>
      tag.attributes.find(
        (attr) => attr.key === "sizes" && attr.value === "196x196"
      )
    );
    if (tag) {
      const attr = tag.attributes.find((attr) => attr.key === "href");
      setFaviconURL(attr.value);
    }
  }, [props.headTags]);

  return (
    <div className={styles.AccountInfo}>
      <Card sx={{ m: 2, flex: "1" }}>
        <CardHeader
          avatar={<PublicIcon fontSize="small" />}
          title={props.instanceName}
        ></CardHeader>
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: "max-content max-content",
            gap: 2,
            alignItems: "center",
            textAlign: "left",
          }}
        >
          {faviconURL ? (
            <img src={faviconURL} height="64px" width="64px" />
          ) : (
            <FontAwesomeIcon className={styles.UploadImg} icon={faCog} />
          )}

          <div className={styles.Links}>
            {domain && (
              <Link
                underline="none"
                color="secondary"
                href={domain}
                target="_blank"
                title="Open live link in standard browser window"
              >
                <FontAwesomeIcon icon={faHome} />
                &nbsp;View Live Domain
              </Link>
            )}
            <Link
              underline="none"
              color="secondary"
              target="_blank"
              title={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.randomHashID}${CONFIG.URL_PREVIEW}`}
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${props.randomHashID}${CONFIG.URL_PREVIEW}`}
            >
              <FontAwesomeIcon icon={faEye} />
              &nbsp;View WebEngine Preview
            </Link>
            <Link
              underline="none"
              color="secondary"
              title="Open this instance accounts overview"
              href={`${CONFIG.URL_ACCOUNTS}/instances/${props.instanceZUID}`}
            >
              <FontAwesomeIcon icon={faUser} />
              &nbsp; Instance Admin
            </Link>
            {!faviconURL ? (
              <AppLink to="/settings/head" title="Set Favicon">
                <FontAwesomeIcon icon={faCog} />
                &nbsp; Set Favicon
              </AppLink>
            ) : (
              ""
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
