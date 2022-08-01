import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchItems } from "shell/store/content";
import { Box, Link as MuiLink } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAsterisk,
  faExternalLinkAlt,
  faLink,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

export const RedirectTargetCell = (props) => {
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
        <span>
          {contentItem?.meta?.contentModelZUID ? (
            <Link
              to={`/content/${contentItem.meta.contentModelZUID}/${props.target}`}
            >
              <FontAwesomeIcon icon={faLink} />
              &nbsp;
              <code>{contentItem.web.path}</code>
            </Link>
          ) : loaded ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FontAwesomeIcon icon={faBan} />
              Redirect Target has been deleted
            </Box>
          ) : (
            <span>Loading...</span>
          )}
        </span>
      ) : props.targetType === "external" ? (
        <span>
          <MuiLink
            underline="none"
            color="secondary"
            href={props.target}
            target="_blank"
            title="Redirect URL"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;<code>{props.target}</code>
          </MuiLink>
        </span>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <FontAwesomeIcon icon={faAsterisk} />
          <code>{props.target}</code>
        </Box>
      )}
    </>
  );
};
