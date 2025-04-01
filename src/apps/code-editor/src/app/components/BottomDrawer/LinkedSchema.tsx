import StorageIcon from "@mui/icons-material/Storage";
import Link from "@mui/material/Link";
import { List, Typography, Divider } from "@mui/material";
import { FileCardListItem, FileCard } from "./FileCard";
import { NavCodeTypes } from "../SideBar/constants";

interface Field {
  ZUID: string;
  name: string;
}

interface LinkedSchemaProps {
  file: NavCodeTypes;
  fields: Field[];
}

export default function LinkedSchema({ file, fields }: LinkedSchemaProps) {
  return (
    <FileCard
      title={`${file?.fileName}'s Related Model Schema`}
      icon={StorageIcon}
      link={`/schema/${file.contentModelZUID}`}
      linkLabel="Edit Linked Schema"
    >
      <Typography variant="body2" color="grey.400">
        Use the below Parsley syntax to reference this model's fields. This will
        dynamically link to the field's content.&nbsp;
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
        {fields.map((field) => (
          <FileCardListItem key={field?.ZUID} gap={0}>
            <span>
              <span className="brackets">{"{{"}</span>
              <span className="keywords">this.</span>
              <span className="fields">{field?.name}</span>
              <span className="brackets">{"}}"}</span>
            </span>
          </FileCardListItem>
        ))}
      </List>
    </FileCard>
  );
}
