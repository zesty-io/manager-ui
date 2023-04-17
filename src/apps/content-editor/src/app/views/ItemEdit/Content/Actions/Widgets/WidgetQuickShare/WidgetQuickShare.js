import { memo } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import ShareIcon from "@mui/icons-material/Share";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import styles from "./WidgetQuickShare.less";
import {
  faFacebookSquare,
  faLinkedinIn,
  faRedditSquare,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
export const WidgetQuickShare = memo(function WidgetQuickShare(props) {
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
    <Card
      id="WidgetQuickShare"
      sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}
      elevation={0}
    >
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: "#10182866",
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "#101828",
          },
        }}
        title="QUICK SHARE"
      ></CardHeader>
      <CardContent
        className="setting-field"
        sx={{
          p: 0,
          pt: 2,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        <Stack
          gap={1.5}
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            letteSpacing: "0px",
          }}
        >
          <Link
            onClick={(evt) =>
              handleOpen(
                evt,
                `https://twitter.com/share?url=${encodeURIComponent(
                  props.url
                )}&text=${encodeURIComponent(props.metaLinkText)}`
              )
            }
            underline="none"
            sx={{
              cursor: "pointer",
              color: "info.dark",
              width: "fit-content",
            }}
          >
            <FontAwesomeIcon
              icon={faTwitterSquare}
              style={{
                color: "#0BA5EC",
                marginRight: "8px",
                width: "16px",
                height: "16px",
              }}
            />
            Twitter
          </Link>
          <Link
            onClick={(evt) =>
              handleOpen(
                evt,
                `http://www.facebook.com/sharer.php?u=${encodeURIComponent(
                  props.url
                )}&t=${encodeURIComponent(props.metaLinkText)}`
              )
            }
            underline="none"
            sx={{
              cursor: "pointer",
              color: "info.dark",
              width: "fit-content",
            }}
          >
            <FontAwesomeIcon
              icon={faFacebookSquare}
              style={{
                color: "#0BA5EC",
                marginRight: "8px",
                width: "16px",
                height: "16px",
              }}
            />
            Facebook
          </Link>
          <Link
            onClick={(evt) =>
              handleOpen(
                evt,
                `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  props.url
                )}`
              )
            }
            underline="none"
            sx={{
              cursor: "pointer",
              color: "info.dark",
              width: "fit-content",
            }}
          >
            <FontAwesomeIcon
              icon={faLinkedinIn}
              style={{
                color: "#0BA5EC",
                marginRight: "8px",
                width: "16px",
                height: "16px",
              }}
            />
            Linkedin
          </Link>
          <Link
            onClick={(evt) =>
              handleOpen(
                evt,
                `http://reddit.com/submit?url=${encodeURIComponent(
                  props.url
                )}&title=${encodeURIComponent(props.metaLinkText)}`
              )
            }
            underline="none"
            sx={{
              cursor: "pointer",
              color: "info.dark",
              width: "fit-content",
            }}
          >
            <FontAwesomeIcon
              icon={faRedditSquare}
              style={{
                color: "#0BA5EC",
                marginRight: "8px",
                width: "16px",
                height: "16px",
              }}
            />
            Reddit
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
});
