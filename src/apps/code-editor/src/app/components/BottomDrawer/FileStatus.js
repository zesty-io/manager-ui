import { useSelector } from "react-redux";
import moment from "moment";
import InfoIcon from "@mui/icons-material/Info";
import { CopyButton } from "@zesty-io/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { FileCard, FileCardListItem } from "./FileCard";
import { List } from "@mui/material";
import { Link } from "react-router-dom";
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
    <FileCard title="File Information" icon={InfoIcon}>
      <List dense>
        {props.file.contentModelZUID && (
          <FileCardListItem>
            Model ZUID:&nbsp;
            <Link
              to={`/schema/${props.file.contentModelZUID}`}
              title="Edit Related Model"
            >
              {props.file.contentModelZUID}
            </Link>
          </FileCardListItem>
        )}

        <FileCardListItem>
          WebEngine Link:&nbsp;
          {!props.file.fileName.includes("/") &&
            props.file.type.includes("ajax-html") && (
              <Link
                underline="none"
                color="grey.400"
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
                color="grey.400"
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
                color="grey.400"
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
                color="grey.400"
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
              color="grey.400"
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
              color="grey.400"
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}/${props.file.fileName}`}
              target="_blank"
              title={`"WebEngine ${props.file.fileName} Link"`}
            >
              {`${props.file.fileName}`}
            </Link>
          )}
        </FileCardListItem>

        <FileCardListItem>
          File ZUID:&nbsp;
          <em>
            <CopyButton
              variant="text"
              size="small"
              value={props.file.ZUID}
              sx={{
                color: "grey.400",
                pl: "25px",
                textAlign: "left",
                "& .MuiButton-startIcon": {
                  position: "absolute",
                  top: "6px",
                  left: "5px",
                },
              }}
            />
          </em>
        </FileCardListItem>
        <FileCardListItem>
          File Type:&nbsp;
          <FileType fileType={props.file.type} fileName={props.file.fileName} />
        </FileCardListItem>

        <FileCardListItem>Branch: {props.file.status}</FileCardListItem>

        {props.file.publishedVersion ? (
          <FileCardListItem>
            Published: Version {props.file.publishedVersion}{" "}
          </FileCardListItem>
        ) : (
          <FileCardListItem>Not Published </FileCardListItem>
        )}
        <FileCardListItem>
          Viewing: Version {props.file.version}{" "}
        </FileCardListItem>

        <FileCardListItem>
          Last edited {moment(props.file.updatedAt).fromNow()}
        </FileCardListItem>

        {props.file.contentModelZUID && (
          <FileCardListItem>
            <Link
              underline="none"
              color="grey.400"
              href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.file.contentModelZUID}.json`}
              target="_blank"
              title={`Preview ${props.file.contentModelZUID} JSON`}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <FlashOnIcon fontSize="small" /> Instant JSON API
            </Link>
          </FileCardListItem>
        )}
      </List>
    </FileCard>
  );
}
