import React from "react";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./WidgetQuickShare.less";

export const WidgetQuickShare = React.memo(function WidgetQuickShare(props) {
  const url = props.live_domain
    ? props.live_domain + props.path
    : props.preview_domain + props.path;

  const handleOpen = (evt, url) => {
    window.open(
      url,
      "Quick Share",
      "width=700,height=450,left=" +
        (evt.target.offsetLeft + 400) +
        ",top=" +
        evt.target.offsetTop
    );
  };

  return (
    <Card id="WidgetQuickShare" className="pageDetailWidget">
      <CardHeader>
        <span>
          <i className="fas fa-share-alt" aria-hidden="true" />
          &nbsp;Quick Share Options
        </span>
      </CardHeader>
      <CardContent className="setting-field">
        <ButtonGroup className={styles.ShareLinks}>
          <span
            className="twitter"
            onClick={evt =>
              handleOpen(
                evt,
                `https://twitter.com/share?url=${encodeURIComponent(
                  url
                )}&text=${encodeURIComponent(props.metaLinkText)}`
              )
            }
          >
            <i className="fab fa-twitter-square" />
            <p>Tweet</p>
          </span>
          <span
            className="facebook"
            onClick={evt =>
              handleOpen(
                evt,
                `http://www.facebook.com/sharer.php?u=${encodeURIComponent(
                  url
                )}&t=${encodeURIComponent(props.metaLinkText)}`
              )
            }
          >
            <i className="fab fa-facebook-square" />
            <p>Share</p>
          </span>
          <span
            className="linkedin"
            onClick={evt =>
              handleOpen(
                evt,
                `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  url
                )}`
              )
            }
          >
            <i className="fab fa-linkedin" />
            <p>Share</p>
          </span>
          <span
            className="reddit"
            onClick={evt =>
              handleOpen(
                evt,
                `http://reddit.com/submit?url=${encodeURIComponent(
                  url
                )}&title=${encodeURIComponent(props.metaLinkText)}`
              )
            }
          >
            <i className="fab fa-reddit-square" />
            <p>Share</p>
          </span>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
});
