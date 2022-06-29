import { memo } from "react";

import { FieldTypeText } from "@zesty-io/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";

import styles from "./MetaKeywords.less";
export const MetaKeywords = memo(function MetaKeywords({
  meta_keywords,
  onChange,
}) {
  return (
    <article className={styles.MetaKeywords} data-cy="metaKeywords">
      <FieldTypeText
        name="metaKeywords"
        label={
          <>
            <Tooltip
              title="Keywords are comma separated words or phrase that describe your page. In 2011 Google denounced keywords; keywords are only used against your page ranking. Use them with caution."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            &nbsp;Meta Keywords
          </>
        }
        value={meta_keywords || ""}
        placeholder="comma, separated, keywords"
        maxLength="500"
        rows={6}
        multiline
        onChange={(evt) => onChange(evt.target.value, "metaKeywords")}
      />
    </article>
  );
});
