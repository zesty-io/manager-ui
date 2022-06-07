import { memo } from "react";

import { FieldTypeText } from "@zesty-io/material";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./MetaLinkText.less";
export const MetaLinkText = memo(function MetaLinkText({
  meta_link_text,
  onChange,
}) {
  return (
    <article className={styles.MetaLinkText} data-cy="metaLinkText">
      <FieldTypeText
        sx={{ my: 2 }}
        name="metaLinkText"
        label={
          <label>
            <Tooltip
              title="The meta link text is used in the content editor navigation and
          programmatically generated navigation with the Parsley 'navigation()'
          function."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            &nbsp;Navigation Link Text
          </label>
        }
        value={meta_link_text}
        placeholder={"This text is used in application navigation"}
        onChange={(evt) => onChange(evt.target.value, "metaLinkText")}
      />
    </article>
  );
});
