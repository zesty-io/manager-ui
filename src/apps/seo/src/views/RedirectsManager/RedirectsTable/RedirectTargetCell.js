import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchItems } from "shell/store/content";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const RedirectTargetCell = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  // Only select content from store if targetType is "page" and select specific object instead of whole store
  const contentItem =
    props.targetType === "page"
      ? useSelector((state) =>
          Object.values(state.content).find(
            (item) => item.meta.ZUID === props.target
          )
        )
      : null;

  useEffect(() => {
    if (props.targetType === "page" && !contentItem?.meta?.contentModelZUID) {
      dispatch(searchItems(props.target)).finally(() => setLoaded(true));
    }
  }, []);

  return (
    <>
      {props.targetType === "page" ? (
        <>
          {contentItem?.meta?.contentModelZUID ? (
            <Link
              to={`/content/${contentItem.meta.contentModelZUID}/${props.target}`}
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                textDecoration: "none",
                color: "info.main",
              }}
            >
              <Typography variant="body2" color="info.main">
                {contentItem.web.path}
              </Typography>
            </Link>
          ) : loaded ? (
            <Typography variant="body2" color="info.main">
              {t("seo.redirectTargetHasBeenDeleted")}
            </Typography>
          ) : (
            <Typography variant="body2" color="info.main">
              {t("seo.loading")}
            </Typography>
          )}
        </>
      ) : props.targetType === "external" ? (
        <MuiLink
          underline="none"
          color="info"
          href={props.target}
          target="_blank"
          title={t("seo.redirectUrl")}
          sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        >
          <Typography variant="body2" color="info.main">
            {props.target}
          </Typography>
        </MuiLink>
      ) : (
        <Typography variant="body2" color="info.main">
          {props.target}
        </Typography>
      )}
    </>
  );
};
