import { memo } from "react";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";

import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./MetaTitle.less";
export const MetaTitle = memo(function MetaTitle({ meta_title, onChange }) {
  return (
    <article className={styles.MetaTitle} data-cy="metaTitle">
      <FieldTypeText
        name="metaTitle"
        label={
          <label>
            <Tooltip
              title="This is the title search engines should use in their results. The maximum amount of characters search engines show is 65 characters, but your title can be longer."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            &nbsp;Meta Title
          </label>
        }
        value={meta_title}
        placeholder="This is the title search engines should use in their results"
        onChange={onChange}
      />
    </article>
  );
});
