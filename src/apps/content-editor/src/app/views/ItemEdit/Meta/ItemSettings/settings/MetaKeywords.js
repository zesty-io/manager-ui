import { memo } from "react";

import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";

import styles from "./MetaKeywords.less";
export const MetaKeywords = memo(function MetaKeywords({
  meta_keywords,
  onChange,
}) {
  return (
    <article className={styles.MetaKeywords} data-cy="metaKeywords">
      <FieldTypeTextarea
        name="metaKeywords"
        label={
          <label>
            <Tooltip
              title="Keywords are comma separated words or phrase that describe your page. In 2011 Google denounced keywords; keywords are only used against your page ranking. Use them with caution."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            &nbsp;Meta Keywords
          </label>
        }
        value={meta_keywords}
        placeholder="comma, separated, keywords"
        maxLength="500"
        onChange={onChange}
      />
    </article>
  );
});
