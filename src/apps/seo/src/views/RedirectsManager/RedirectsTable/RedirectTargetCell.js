import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchItems } from "shell/store/content";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import InsertLinkRoundedIcon from "@mui/icons-material/InsertLinkRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import SvgIcon from "@mui/material/SvgIcon";

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
          <SvgIcon fontSize="xsmall" color="currentColor">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path
                fill="currentColor"
                d="M478.21 334.093L336 256l142.21-78.093c11.795-6.477 15.961-21.384 9.232-33.037l-19.48-33.741c-6.728-11.653-21.72-15.499-33.227-8.523L296 186.718l3.475-162.204C299.763 11.061 288.937 0 275.48 0h-38.96c-13.456 0-24.283 11.061-23.994 24.514L216 186.718 77.265 102.607c-11.506-6.976-26.499-3.13-33.227 8.523l-19.48 33.741c-6.728 11.653-2.562 26.56 9.233 33.037L176 256 33.79 334.093c-11.795 6.477-15.961 21.384-9.232 33.037l19.48 33.741c6.728 11.653 21.721 15.499 33.227 8.523L216 325.282l-3.475 162.204C212.237 500.939 223.064 512 236.52 512h38.961c13.456 0 24.283-11.061 23.995-24.514L296 325.282l138.735 84.111c11.506 6.976 26.499 3.13 33.227-8.523l19.48-33.741c6.728-11.653 2.563-26.559-9.232-33.036z"
              ></path>
            </svg>
          </SvgIcon>
          <Typography variant="body2">{props.target}</Typography>
        </CellWrapper>
      )}
    </>
  );
};
