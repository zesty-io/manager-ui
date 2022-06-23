import { useSelector } from "react-redux";
import moment from "moment";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import InfoIcon from "@mui/icons-material/Info";

import { AppLink } from "@zesty-io/core/AppLink";
import { CopyButton } from "@zesty-io/material";

import styles from "./FileStatus.less";

const FileType = (props) => {
  if (
    props.fileType === "templateset" ||
    props.fileType === "pageset" ||
    props.fileType === "dataset"
  ) {
    return `Model View`;
  }
  if (props.fileType === "ajax-json" || props.fileType === "ajax-html") {
    if (props.fileName.includes("/")) {
      let extension = props.fileName.split(".").slice(-1);
      return `Custom File Type (${extension})`;
    } else {
      return `Legacy File`;
    }
  }

  if (props.fileType === "404") {
    return `404`;
  } else {
    return props.fileType;
  }
};

export default function FileStatus(props) {
  const instance = useSelector((state) => state.instance);

  return (
    <Card
      className={cx(styles.FileStatus)}
      sx={{
        m: 2,
        backgroundColor: "#292828", // overwrite material theme cardheader color for dark cards
        color: "#b1b1b3 ",
        width: "400px",
      }}
    >
      <CardHeader
        avatar={<InfoIcon fontSize="small" />}
        title="File Information"
        sx={{ backgroundColor: "#272728" }}
      ></CardHeader>

      <CardContent>
        <ul>
          {props.file.contentModelZUID && (
            <li>
              Model ZUID:&nbsp;
              <AppLink
                className={styles.FileLink}
                to={`/schema/${props.file.contentModelZUID}`}
                title="Edit Related Model"
              >
                {props.file.contentModelZUID}
              </AppLink>
            </li>
          )}

          <li>
            WebEngine Link:&nbsp;
            {!props.file.fileName.includes("/") &&
              props.file.type.includes("ajax-html") && (
                <Link
                  underline="none"
                  color="secondary"
                  href={`${CONFIG.URL_PREVIEW_FULL}/-/ajax/${props.file.fileName}/`}
                  target="_blank"
                  title={`Preview ${props.file.fileName} Webpage`}
                >
                  <em>/-/ajax/{props.file.fileName}/</em>
                </Link>
              )}
            {!props.file.fileName.includes("/") &&
              props.file.type.includes("ajax-json") && (
                <Link
                  underline="none"
                  color="secondary"
                  href={`${CONFIG.URL_PREVIEW_FULL}/-/custom/${props.file.fileName}/`}
                  target="_blank"
                  title={`Preview ${props.file.fileName} Webpage`}
                >
                  <em>/-/custom/{props.file.fileName}/</em>
                </Link>
              )}
            {props.file.ZUID.includes("10-") &&
              props.file.type.includes("javascript") && (
                <Link
                  underline="none"
                  color="secondary"
                  href={`${CONFIG.URL_PREVIEW_FULL}/site.js`}
                  target="_blank"
                  title="Preview Javascript Webpage"
                >
                  <em>Compiles to /site.js</em>
                </Link>
              )}
            {props.file.ZUID.includes("10-") &&
              !props.file.type.includes("javascript") && (
                <Link
                  underline="none"
                  color="secondary"
                  href={`${CONFIG.URL_PREVIEW_FULL}/site.css`}
                  target="_blank"
                  title="Preview CSS Webpage"
                >
                  <em>Compiles to /site.css</em>
                </Link>
              )}
            {props.file.contentModelZUID && props.items.length !== 0 && (
              <Link
                underline="none"
                color="secondary"
                href={`${CONFIG.URL_PREVIEW_FULL}${props.items[0].web.path}`}
                target="_blank"
                title={`Preview ${props.items[0].web.path} Webpage `}
              >
                <em>{props.items[0].web.path}</em>
              </Link>
            )}
            {!props.file.contentModelZUID && props.file.fileName.includes("/") && (
              <Link
                underline="none"
                color="secondary"
                href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}/${props.file.fileName}`}
                target="_blank"
                title={`"WebEngine ${props.file.fileName} Link"`}
              >
                {`${props.file.fileName}`}
              </Link>
            )}
          </li>

          <li>
            File ZUID:&nbsp;
            <em>
              <CopyButton
                variant="contained"
                size="small"
                value={props.file.ZUID}
              />
            </em>
          </li>
          <li>
            File Type:&nbsp;
            <FileType
              fileType={props.file.type}
              fileName={props.file.fileName}
            />
          </li>

          <li>Branch: {props.file.status}</li>

          {props.file.publishedVersion ? (
            <li>Published: Version {props.file.publishedVersion} </li>
          ) : (
            <li>Not Published </li>
          )}
          <li>Viewing: Version {props.file.version} </li>

          <li>Last edited {moment(props.file.updatedAt).fromNow()}</li>

          {props.file.contentModelZUID && (
            <li>
              <Link
                underline="none"
                color="secondary"
                href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.file.contentModelZUID}.json`}
                target="_blank"
                title={`Preview ${props.file.contentModelZUID} JSON`}
              >
                <FontAwesomeIcon icon={faBolt} /> Instant JSON API
              </Link>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
