import { memo, Fragment } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import LinkIcon from "@mui/icons-material/Link";

import { PreviewUrl } from "../../../../components/Header/PreviewUrl";
import { LiveUrl } from "../../../../components/Header/LiveUrl";
import { InstantUrl } from "./InstantUrl";

import styles from "./ContentLinks.less";

export const ContentLinks = memo(function ContentLinks(props) {
  return (
    <Fragment>
      <Card className={styles.ContentLinks} sx={{ m: 2 }} elevation={0}>
        <CardHeader
          sx={{
            p: 0,
            backgroundColor: "transparent",
            fontSize: "16px",
            color: "#10182866",
            ".MuiCardHeader-avatar": {
              mr: 1,
            },
          }}
          titleTypographyProps={{
            sx: {
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#101828",
            },
          }}
          avatar={<LinkIcon fontSize="inherit" color="inherit" />}
          title="Links"
        ></CardHeader>
        <CardContent
          className={styles.Content}
          sx={{
            p: 0,
          }}
        >
          <ul>
            {props.item?.web?.path && (
              <Fragment>
                <li>
                  <LiveUrl item={props.item} />
                </li>
                <li>
                  <PreviewUrl item={props.item} />
                </li>
              </Fragment>
            )}

            <li>
              <InstantUrl item={props.item} />
            </li>
          </ul>
        </CardContent>
      </Card>
    </Fragment>
  );
});
