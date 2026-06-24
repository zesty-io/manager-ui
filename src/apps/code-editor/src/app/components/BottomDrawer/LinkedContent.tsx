import { Link, Typography, List, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { FileCard, FileCardListItem } from "./FileCard";
import { NavLink } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LaunchIcon from "@mui/icons-material/Launch";
import { NavCodeTypes } from "../constants";
import { useTranslation } from "react-i18next";

interface Meta {
  ZUID: string;
  contentModelZUID: string;
}

interface Web {
  metaTitle: string;
  path: string;
}

interface Item {
  meta: Meta;
  web: Web;
}

interface LinkedContentProps {
  file: NavCodeTypes;
  items?: Item[];
}

export default function LinkedContent({ file, items }: LinkedContentProps) {
  const { t } = useTranslation();
  return (
    <FileCard
      title={t("code.linkedContent")}
      icon={EditIcon}
      link={`/content/${file.contentModelZUID}`}
      linkLabel={t("code.editLinkedContent")}
    >
      <Typography variant="body2" color="grey.400">
        {t("code.linkedContentDescription")}
      </Typography>

      {!!items?.length && (
        <>
          <Divider sx={{ my: 1, border: "none" }} />
          <List>
            {items.map((item) => (
              <FileCardListItem key={item.meta.ZUID}>
                {!!item?.meta?.contentModelZUID &&
                  !!item?.meta?.ZUID &&
                  !!item.web.metaTitle && (
                    <NavLink
                      to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                      title={t("code.editItemContent")}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        position: "relative",
                        marginBottom: "5px",
                        color: "info.main",
                      }}
                    >
                      <LaunchIcon
                        fontSize="small"
                        sx={{ position: "absolute", color: "info.main" }}
                      />
                      <Typography
                        variant="body2"
                        pl={3}
                        color="info"
                        sx={{ color: "info.main" }}
                      >
                        {item.web.metaTitle}
                      </Typography>
                    </NavLink>
                  )}

                {!!item?.web?.path && (
                  <Link
                    underline="none"
                    sx={{
                      alignItems: "baseline",
                      display: "flex",
                      position: "relative",
                      color: "info.dark",
                    }}
                    // @ts-expect-error Config not typed
                    href={`${CONFIG?.URL_PREVIEW_FULL}${item?.web?.path}`}
                    target="_blank"
                    title={t("code.previewItemWebpage")}
                  >
                    <VisibilityIcon
                      sx={{
                        position: "absolute",
                        color: "info.dark",
                        fontSize: "18px",
                        top: "1px",
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontStyle="italic"
                      pl={3}
                      sx={{ color: "grey.400" }}
                    >
                      {item.web.path}
                    </Typography>
                  </Link>
                )}
              </FileCardListItem>
            ))}
          </List>
        </>
      )}
    </FileCard>
  );
}
