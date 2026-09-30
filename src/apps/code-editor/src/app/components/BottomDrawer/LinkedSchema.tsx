import Link from "@mui/material/Link";
import { List, Typography, Divider } from "@mui/material";
import { FileCardListItem, FileCard } from "./FileCard";
import { Database } from "@zesty-io/material";
import { NavCodeTypes } from "../constants";
import { useTranslation } from "react-i18next";

interface Field {
  ZUID: string;
  name: string;
}

interface LinkedSchemaProps {
  file: NavCodeTypes;
  fields: Field[];
}

export default function LinkedSchema({ file, fields }: LinkedSchemaProps) {
  const { t } = useTranslation();
  return (
    <FileCard
      title={t("code.linkedSchemaTitle", { fileName: file?.fileName })}
      icon={Database}
      link={`/schema/${file.contentModelZUID}`}
      linkLabel={t("code.editLinkedSchema")}
    >
      <Typography variant="body2" color="grey.400">
        {t("code.linkedSchemaBodyText")}&nbsp;
        <Link
          href="https://zesty.org/services/web-engine/introduction-to-parsley"
          target="_blank"
          title={t("code.learnMoreParsleySyntax")}
        >
          {t("code.learnMoreParsleySyntax")}
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
