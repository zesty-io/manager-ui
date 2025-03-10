import StorageIcon from "@mui/icons-material/Storage";
import Link from "@mui/material/Link";
import { List, Typography, Divider } from "@mui/material";
import { FileCardListItem, FileCard } from "../../FileCard";

export default function LinkedSchema(props) {
  return (
    <FileCard
      title={`${props.file.fileName}'s  Related Model Schema`}
      icon={StorageIcon}
      link={`/content/${props.file.contentModelZUID}`}
      linkLabel="Edit Linked Schema"
    >
      <Typography variant="body2">
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
      <List>
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
