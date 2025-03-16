import StorageIcon from "@mui/icons-material/Storage";
import Link from "@mui/material/Link";
import { List, Typography, Divider } from "@mui/material";
import { FileCardListItem, FileCard } from "./FileCard";

export default function LinkedSchema(props) {
  return (
    <FileCard
      title={`${props.file.fileName}'s  Related Model Schema`}
      icon={StorageIcon}
      link={`/content/${props.file.contentModelZUID}`}
      linkLabel="Edit Linked Schema"
    >
      <Typography variant="body2" color="grey.400">
        Use the below Parsley syntax to reference this models fields. This will
        dynamically link to the fields content.&nbsp;
        <Link
          href="https://zesty.org/services/web-engine/introduction-to-parsley"
          target="_blank"
          title="Learn More Parsley Syntax"
        >
          Learn More Parsley Syntax
        </Link>
      </Typography>
      <Divider sx={{ my: 1, border: "none" }} />
      <List
        sx={{
          "& span.brackets, & span.fields, & span.keywords, & a": (theme) => ({
            ...theme.typography.body2,
          }),
          "& span.brackets": {
            color: "#95c65c",
          },
          "& span.keywords": {
            color: "#91ace8",
          },
          "& span.fields": {
            color: "grey.300",
          },
        }}
      >
        {props.fields.map((field) => (
          <FileCardListItem key={field.ZUID}>
            <span>
              <span className="brackets">{"{{"}</span>
              <span className="keywords">this.</span>
              <span className="fields">{field.name}</span>
              <span className="brackets">{"}}"}</span>
            </span>
          </FileCardListItem>
        ))}
      </List>
    </FileCard>
  );
}
