import { useSelector } from "react-redux";
import moment from "moment";
import InfoIcon from "@mui/icons-material/Info";
import { CopyButton } from "@zesty-io/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { FileCard, FileCardListItem } from "./FileCard";
import { List, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { NavCodeTypes } from "../constants";
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
  //@ts-expect-error
  const urlPreview = CONFIG.URL_PREVIEW_FULL;
  const urlFileName = file?.fileName?.trim()?.replace(/^\/+/, "");

  const getWebLinkData = () => {
    const { fileName, type, ZUID, contentModelZUID } = file;
    const isAjaxFile = !fileName.includes("/") && type.includes("ajax-html");
    const isCustomFile = !fileName.includes("/") && type.includes("ajax-json");
    const isSiteJs = ZUID.includes("10-") && type.includes("javascript");
    const isSiteCss = ZUID.includes("10-") && !type.includes("javascript");
    const isWebPath =
      contentModelZUID && items.length > 0 && items[0]?.web?.path;
    const isFileLink = !contentModelZUID && fileName.includes("/");

    if (isAjaxFile) {
      return {
        path: `${urlPreview}/-/ajax/${urlFileName}/`,
        label: ` /-/ajax/${urlFileName}/`,
        tooltip: `Preview ${fileName} Webpage`,
      };
    }

    if (isCustomFile) {
      return {
        path: `${urlPreview}/-/custom/${urlFileName}/`,
        label: `/-/custom/${urlFileName}/`,
        tooltip: `Preview ${fileName} Webpage`,
      };
    }

    if (isSiteJs) {
      return {
        path: `${urlPreview}/site.js`,
        label: "Compiles to /site.js",
        tooltip: "Preview Javascript Webpage",
      };
    }

    if (isSiteCss) {
      return {
        path: `${urlPreview}/site.css`,
        label: "Compiles to /site.css",
        tooltip: "Preview CSS Webpage",
      };
    }

    if (isWebPath) {
      return {
        path: `${urlPreview}/${items[0]?.web?.path
          ?.trim()
          ?.replace(/^\/+/, "")}`,
        label: items[0]?.web?.path,
        tooltip: `Preview ${items[0]?.web?.path} Webpage`,
      };
    }

    if (isFileLink) {
      return {
        path: `${urlPreview}/${urlFileName}`,
        label: fileName,
        tooltip: `WebEngine ${fileName} Link`,
      };
    }

    return null;
  };

  const webLinkData = getWebLinkData();

  return (
    <FileCard title="File Information" icon={InfoIcon}>
      <List dense>
        {file?.contentModelZUID && (
          <FileCardListItem>
            {`Model ZUID: `}
            <RouterLink
              to={`/schema/${file?.contentModelZUID}`}
              title="Edit Related Model"
            >
              {file.contentModelZUID}
            </RouterLink>
          </FileCardListItem>
        )}

        {!!webLinkData && (
          <FileCardListItem>
            {`WebEngine Link: `}
            <Link
              href={webLinkData?.path}
              target="_blank"
              title={webLinkData?.tooltip}
            >
              {webLinkData?.label}
            </Link>
          </FileCardListItem>
        )}

        <FileCardListItem>
          {`File ZUID: `}
          <CopyButton
            variant="text"
            size="small"
            value={file.ZUID}
            color="inherit"
            sx={{
              fontStyle: "italic",
              color: "grey.400",
              pl: "25px",
              py: "3px",
              lineHeight: 1,
              textAlign: "left",
              verticalAlign: "baseline",
              "& .MuiButton-startIcon": {
                position: "absolute",
                top: "2px",
                left: "5px",

                "& svg": {
                  fontSize: "16px",
                },
              },
            }}
          />
        </FileCardListItem>
        <FileCardListItem>
          {`File Type: `}
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
          href={`${urlPreview}/-/instant/${file.contentModelZUID}.json`}
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
