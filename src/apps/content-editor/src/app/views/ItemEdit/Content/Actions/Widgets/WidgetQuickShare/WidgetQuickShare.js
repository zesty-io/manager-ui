import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./WidgetQuickShare.less";
import {
  faFacebookSquare,
  faLinkedinIn,
  faRedditSquare,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
export const WidgetQuickShare = React.memo(function WidgetQuickShare(props) {
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
    <Card id="WidgetQuickShare" className={styles.pageDetailWidget}>
      <CardHeader>
        <span>
          <FontAwesomeIcon icon={faShareAlt} />
          &nbsp;Quick Share Options
        </span>
      </CardHeader>
      <CardContent className="setting-field">
        <ButtonGroup className={styles.ShareLinks}>
          <span
            className="twitter"
            onClick={(evt) =>
              handleOpen(
                evt,
                `https://twitter.com/share?url=${encodeURIComponent(
                  props.url
                )}&text=${encodeURIComponent(props.metaLinkText)}`
              )
            }
          >
            <FontAwesomeIcon icon={faTwitterSquare} />
            <p>Tweet</p>
          </span>
          <span
            className="facebook"
            onClick={(evt) =>
              handleOpen(
                evt,
                `http://www.facebook.com/sharer.php?u=${encodeURIComponent(
                  props.url
                )}&t=${encodeURIComponent(props.metaLinkText)}`
              )
            }
          >
            <FontAwesomeIcon icon={faFacebookSquare} />
            <p>Share</p>
          </span>
          <span
            className="linkedin"
            onClick={(evt) =>
              handleOpen(
                evt,
                `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  props.url
                )}`
              )
            }
          >
            <FontAwesomeIcon icon={faLinkedinIn} />
            <p>Share</p>
          </span>
          <span
            className="reddit"
            onClick={(evt) =>
              handleOpen(
                evt,
                `http://reddit.com/submit?url=${encodeURIComponent(
                  props.url
                )}&title=${encodeURIComponent(props.metaLinkText)}`
              )
            }
          >
            <FontAwesomeIcon icon={faRedditSquare} />
            <p>Share</p>
          </span>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
});
