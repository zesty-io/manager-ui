import { useSelector } from "react-redux";
import moment from "moment";
import InfoIcon from "@mui/icons-material/Info";
import { CopyButton } from "@zesty-io/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { FileCard, FileCardListItem } from "./FileCard";
import { List, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import { NavCodeTypes } from "../SideBar/constants";
import Typography from "@mui/material/Typography";

interface ItemWeb {
  path: string;
}

interface Item {
  web: ItemWeb;
}

interface FileStatusProps {
  file: NavCodeTypes;
  items: Item[];
}

const FileType = ({
  fileType,
  fileName,
}: {
  fileType: string;
  fileName: string;
}) => {
  if (["templateset", "pageset", "dataset"].includes(fileType)) {
    return `Model View`;
  }
  if (["ajax-json", "ajax-html"].includes(fileType)) {
    if (fileName.includes("/")) {
      let extension = fileName.split(".").slice(-1);
      return `Custom File Type (${extension})`;
    } else {
      return `Legacy File`;
    }
  }
  return fileType === "404" ? "404" : fileType;
};

export default function FileStatus({ file, items }: FileStatusProps) {
  const instance = useSelector((state: any) => state.instance);

  return (
    <FileCard title="File Information" icon={InfoIcon}>
      <List dense>
        {file?.contentModelZUID && (
          <FileCardListItem>
            Model ZUID:&nbsp;
            <Link
              to={`/schema/${file?.contentModelZUID}`}
              title="Edit Related Model"
            >
              {file.contentModelZUID}
            </Link>
          </FileCardListItem>
        )}

        <FileCardListItem>
          WebEngine Link:&nbsp;
          {!file.fileName.includes("/") && file.type.includes("ajax-html") && (
            <Link
              to={`/-/ajax/${file.fileName}/`}
              target="_blank"
              title={`Preview ${file.fileName} Webpage`}
            >
              /-/ajax/{file.fileName}/
            </Link>
          )}
          {!file.fileName.includes("/") && file.type.includes("ajax-json") && (
            <Link
              to={`/-/custom/${file.fileName}/`}
              target="_blank"
              title={`Preview ${file.fileName} Webpage`}
            >
              /-/custom/{file.fileName}/
            </Link>
          )}
          {file.ZUID.includes("10-") && file.type.includes("javascript") && (
            <Link
              to="/site.js"
              target="_blank"
              title="Preview Javascript Webpage"
            >
              Compiles to /site.js
            </Link>
          )}
          {file.ZUID.includes("10-") && !file.type.includes("javascript") && (
            <Link to="/site.css" target="_blank" title="Preview CSS Webpage">
              Compiles to /site.css
            </Link>
          )}
          {file.contentModelZUID &&
            items.length !== 0 &&
            items?.[0]?.web?.path && (
              <Link
                to={items?.[0]?.web?.path}
                target="_blank"
                title={`Preview ${items[0].web.path} Webpage`}
              >
                {items[0].web.path}
              </Link>
            )}
          {!file.contentModelZUID && file.fileName.includes("/") && (
            <Link
              to={`/${file.fileName}`}
              target="_blank"
              title={`WebEngine ${file.fileName} Link`}
            >
              {file.fileName}
            </Link>
          )}
        </FileCardListItem>

        <FileCardListItem>
          File ZUID:&nbsp;
          <CopyButton
            variant="text"
            size="small"
            value={file.ZUID}
            sx={{
              fontStyle: "italic",
              color: "grey.400",
              pl: "25px",
              pb: "5px",
              textAlign: "left",
              "& .MuiButton-startIcon": {
                position: "absolute",
                top: "6px",
                left: "5px",
              },
            }}
          />
        </FileCardListItem>
        <FileCardListItem>
          File Type:&nbsp;
          {FileType({ fileType: file.type, fileName: file.fileName })}
        </FileCardListItem>
        <FileCardListItem>Branch: {file.status}</FileCardListItem>
        {file.publishedVersion ? (
          <FileCardListItem>
            Published:&nbsp;Version {file.publishedVersion}
          </FileCardListItem>
        ) : (
          <FileCardListItem>Not Published</FileCardListItem>
        )}
        <FileCardListItem>
          Viewing:&nbsp;Version {file.version}
        </FileCardListItem>
        <FileCardListItem>
          Last edited:&nbsp;{moment(file.updatedAt).fromNow()}
        </FileCardListItem>

        <Divider sx={{ my: 1, border: "none" }} />
      </List>
      {file.contentModelZUID && (
        <Link
          to={`/-/instant/${file.contentModelZUID}.json`}
          target="_blank"
          title={`Preview ${file.contentModelZUID} JSON`}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <FlashOnIcon sx={{ fontSize: "18px" }} />
          <Typography variant="body2">Instant JSON API</Typography>
        </Link>
      )}
    </FileCard>
  );
}
