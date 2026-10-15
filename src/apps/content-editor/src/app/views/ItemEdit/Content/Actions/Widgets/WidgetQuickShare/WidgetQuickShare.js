import { alpha } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Link from "@mui/material/Link";
import {
  faFacebookSquare,
  faLinkedinIn,
  faRedditSquare,
  faTwitterSquare,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";

export const WidgetQuickShare = memo(function WidgetQuickShare(props) {
  const { t } = useTranslation();
  const handleOpen = (evt, url) => {
    window.open(
      url,
      "QuickShare",
      "width=700,height=450,left=" +
        (evt.target.offsetLeft + 400) +
        ",top=" +
        evt.target.offsetTop
    );
  };

  return (
    <Card
      id="WidgetQuickShare"
      sx={{ mb: 3, backgroundColor: "transparent" }}
      elevation={0}
    >
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          color: alpha(theme.palette.text.primary, 0.4),
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          variant: "overline",
          sx: {
            fontWeight: 400,
            color: "text.primary",
            textTransform: "uppercase",
          },
        }}
        title={t("content.itemEditQuickShareTitle")}
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
        {props.isLoadingItem ? (
          <Stack gap={1.5}>
            {[...Array(4)].map((_, index) => (
              <Stack key={index} gap={1} direction="row">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="rounded" width={84} height={20} />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack
            gap={1.5}
            sx={{
              typography: "body2",
              fontWeight: 500,
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
                  color: theme.palette.info.main,
                  marginRight: "8px",
                  width: "16px",
                  height: "16px",
                }}
              />
              {/* eslint-disable-next-line i18next/no-literal-string -- brand name */}
              <>Twitter</>
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
                  color: theme.palette.info.main,
                  marginRight: "8px",
                  width: "16px",
                  height: "16px",
                }}
              />
              {/* eslint-disable-next-line i18next/no-literal-string -- brand name */}
              <>Facebook</>
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
                  color: theme.palette.info.main,
                  marginRight: "8px",
                  width: "16px",
                  height: "16px",
                }}
              />
              {/* eslint-disable-next-line i18next/no-literal-string -- brand name */}
              <>Linkedin</>
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
                  color: theme.palette.info.main,
                  marginRight: "8px",
                  width: "16px",
                  height: "16px",
                }}
              />
              {/* eslint-disable-next-line i18next/no-literal-string -- brand name */}
              <>Reddit</>
            </Link>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
});
