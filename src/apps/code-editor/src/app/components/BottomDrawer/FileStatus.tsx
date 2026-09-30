import { useSelector } from "react-redux";
import { formatDistanceToNowLocalized } from "shell/i18n/dates";
import { isValid } from "date-fns";
import InfoIcon from "@mui/icons-material/Info";
import { CopyButton } from "@zesty-io/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { FileCard, FileCardListItem } from "./FileCard";
import { List, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { NavCodeTypes } from "../constants";
import { useTranslation } from "react-i18next";
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

const FileType = (
  {
    fileType,
    fileName,
  }: {
    fileType: string;
    fileName: string;
  },
  t: (key: string, opts?: Record<string, unknown>) => string
) => {
  if (["templateset", "pageset", "dataset"].includes(fileType)) {
    return t("code.fileTypeModelView");
  }
  if (["ajax-json", "ajax-html"].includes(fileType)) {
    if (fileName.includes("/")) {
      let extension = fileName.split(".").slice(-1);
      return t("code.fileTypeCustom", { extension });
    } else {
      return t("code.fileTypeLegacy");
    }
  }
  return fileType === "404" ? "404" : fileType;
};

export default function FileStatus({ file, items }: FileStatusProps) {
  const { t } = useTranslation();
  const instance = useSelector((state: any) => state.instance);
  const urlPreview = CONFIG.URL_PREVIEW_FULL;
  const urlFileName = file?.fileName?.trim()?.replace(/^\/+/, "");

  const edited = new Date(file.updatedAt);
  const editedText = isValid(edited)
    ? formatDistanceToNowLocalized(edited, { addSuffix: true })
    : "";

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
        tooltip: t("code.previewFileWebpage", { fileName }),
      };
    }

    if (isCustomFile) {
      return {
        path: `${urlPreview}/-/custom/${urlFileName}/`,
        label: `/-/custom/${urlFileName}/`,
        tooltip: t("code.previewFileWebpage", { fileName }),
      };
    }

    if (isSiteJs) {
      return {
        path: `${urlPreview}/site.js`,
        label: t("code.compilesToSiteJs", { file: "/site.js" }),
        tooltip: t("code.previewJavascriptWebpage"),
      };
    }

    if (isSiteCss) {
      return {
        path: `${urlPreview}/site.css`,
        label: t("code.compilesToSiteCss", { file: "/site.css" }),
        tooltip: t("code.previewCssWebpage"),
      };
    }

    if (isWebPath) {
      return {
        path: `${urlPreview}/${items[0]?.web?.path
          ?.trim()
          ?.replace(/^\/+/, "")}`,
        label: items[0]?.web?.path,
        tooltip: t("code.previewPathWebpage", { path: items[0]?.web?.path }),
      };
    }

    if (isFileLink) {
      return {
        path: `${urlPreview}/${urlFileName}`,
        label: fileName,
        tooltip: t("code.webEngineFileLink", { fileName }),
      };
    }

    return null;
  };

  const webLinkData = getWebLinkData();

  return (
    <FileCard title={t("code.fileInformation")} icon={InfoIcon}>
      <List dense>
        {file?.contentModelZUID && (
          <FileCardListItem>
            {t("code.modelZuid")}
            {": "}
            <RouterLink
              to={`/schema/${file?.contentModelZUID}`}
              title={t("code.editRelatedModel")}
            >
              {file.contentModelZUID}
            </RouterLink>
          </FileCardListItem>
        )}

        {!!webLinkData && (
          <FileCardListItem>
            {t("code.webEngineLink")}
            {": "}
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
          {t("code.fileZuid")}
          {": "}
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
          {t("code.fileType")}
          {": "}
          {FileType({ fileType: file.type, fileName: file.fileName }, t)}
        </FileCardListItem>
        <FileCardListItem>
          {t("code.branch")}
          {": "}
          {file.status}
        </FileCardListItem>
        {file.publishedVersion ? (
          <FileCardListItem>
            {t("code.publishedVersion", { n: file.publishedVersion })}
          </FileCardListItem>
        ) : (
          <FileCardListItem>
            {t("shell.relationalStatusNotPublished")}
          </FileCardListItem>
        )}
        <FileCardListItem>
          {t("code.viewingVersion", { n: file.version })}
        </FileCardListItem>
        <FileCardListItem>
          {t("code.lastEdited")}
          {":"}&nbsp;{editedText}
        </FileCardListItem>

        <Divider sx={{ my: 1, border: "none" }} />
      </List>
      {file.contentModelZUID && (
        <Link
          href={`${urlPreview}/-/instant/${file.contentModelZUID}.json`}
          target="_blank"
          title={t("code.previewInstantJson", {
            path: `${file.contentModelZUID} JSON`,
          })}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <FlashOnIcon sx={{ fontSize: "18px" }} />
          <Typography variant="body2">{t("code.instantJsonApi")}</Typography>
        </Link>
      )}
    </FileCard>
  );
}
