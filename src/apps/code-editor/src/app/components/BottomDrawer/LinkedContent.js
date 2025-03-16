import { Link, Typography, List, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { FileCard, FileCardListItem } from "./FileCard";
import { NavLink } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
export default function LinkedContent(props) {
  return (
    <FileCard
      title="Linked Content"
      icon={EditIcon}
      link={`/content/${props.file.contentModelZUID}`}
      linkLabel="Edit Linked Content"
    >
      <Typography variant="body2" color="grey.400">
        Shown are the three latest content entries from this views linked model.
      </Typography>

      <Divider sx={{ my: 1, border: "none" }} />

      <List>
        {props.items.map((item) => {
          return (
            <FileCardListItem key={item.meta.ZUID}>
              <NavLink
                to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                title="Edit item content"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  position: "relative",
                  marginBottom: "5px",
                  color: "info.main",
                }}
              >
                <EditNoteIcon
                  sx={{ position: "absolute", color: "info.main" }}
                />
                <Typography
                  variant="body2"
                  pl={3.5}
                  color="info"
                  sx={{ color: "info.main" }}
                >
                  {item.web.metaTitle}
                </Typography>
              </NavLink>

              <Link
                underline="none"
                sx={{
                  alignItems: "baseline",
                  display: "flex",
                  position: "relative",
                  color: "info.main",
                }}
                href={`${CONFIG.URL_PREVIEW_FULL}${item.web.path}`}
                target="_blank"
                title="Preview Item Webpage"
              >
                <VisibilityIcon
                  fontSize="small"
                  sx={{
                    position: "absolute",
                    fontSize: 16,
                    top: "3px",
                    color: "info.dark",
                  }}
                />
                <Typography
                  variant="body2"
                  fontStyle="italic"
                  pl={3.5}
                  sx={{ color: "grey.400" }}
                >
                  {item.web.path}
                </Typography>
              </Link>
            </FileCardListItem>
          );
        })}
      </List>
    </FileCard>
  );
}
