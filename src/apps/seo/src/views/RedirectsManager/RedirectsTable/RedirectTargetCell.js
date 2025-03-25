import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchItems } from "shell/store/content";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import InsertLinkRoundedIcon from "@mui/icons-material/InsertLinkRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const RedirectTargetCell = (props) => {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const CellWrapper = props?.wrapper ?? Box;
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
              }}
            >
              <CellWrapper color="info.dark" type="link">
                <InsertLinkRoundedIcon />
                <Typography variant="body2">{contentItem.web.path}</Typography>
              </CellWrapper>
            </Link>
          ) : loaded ? (
            <CellWrapper>
              <BlockRoundedIcon fontSize="small" />
              <Typography variant="body2">Redirect Target has been</Typography>
            </CellWrapper>
          ) : (
            <Typography variant="body2">Loading...</Typography>
          )}
        </>
      ) : props.targetType === "external" ? (
        <MuiLink
          underline="none"
          color="secondary"
          href={props.target}
          target="_blank"
          title="Redirect URL"
          sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        >
          <CellWrapper color="primary.main" type="link">
            <OpenInNewRoundedIcon fontSize="small" />
            <Typography variant="body2">{props.target}</Typography>
          </CellWrapper>
        </MuiLink>
      ) : (
        <CellWrapper>
          <FontAwesomeIcon icon={faAsterisk} />
          <Typography variant="body2">{props.target}</Typography>
        </CellWrapper>
      )}
    </>
  );
};
