import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import cx from "classnames";

import { Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Notice } from "shell/components/legacy/Notice";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import { fetchHeadTags, addHeadTag } from "shell/store/headTags";
import { useDomain } from "shell/hooks/use-domain";
import { useGetLegacyHeadTagsQuery } from "../../services/instance";

import styles from "./Head.less";
export default connect((state, props) => {
  let item;
  if (props.resourceZUID) {
    // TODO: model level tags. Currently not supported by API
    if (props.resourceZUID.charAt(0) === "6") {
    }

    // item level tags
    if (props.resourceZUID.charAt(0) === "7") {
      item = state.content[props.resourceZUID];
    }
    // instance level tags
    if (props.resourceZUID.charAt(0) === "8") {
      item = state.instance;
    }
  }

  return {
    item,
    instanceName: state.instance.name,
    tags: Object.values(state.headTags)
      .filter((tag) => tag.resourceZUID === props.resourceZUID)
      .sort((a, b) => a.sort > b.sort),
  };
})(function Head(props) {
  const { t } = useTranslation();
  const domain = useDomain();
  const { data: rawLegacyHeadTags } = useGetLegacyHeadTagsQuery();

  useEffect(() => {
    props.dispatch(fetchHeadTags());
  }, []);

  const legacyHeadTags = useMemo(() => {
    const customRawLegacyHeadTags = rawLegacyHeadTags?.filter(
      (tag) => tag.resourceZUID === null && tag.ID > 1 && tag.type !== "doctype"
    );

    return customRawLegacyHeadTags?.map((tag) => {
      const attributes = tag?.keys?.split("*|*").map((attr) => {
        const [key, value] = attr.split(":");

        return {
          key,
          value,
        };
      });

      return {
        type: tag.nodeName,
        attributes,
      };
    });
  }, [rawLegacyHeadTags]);

  function handleAdd() {
    props.dispatch(addHeadTag(props.resourceZUID, props.tags.length));
  }

  return (
    <div className={styles.Head}>
      <main className={styles.Tags}>
        <div className={styles.Notice}>
          <Button
            title={t("shell.headCreateTag")}
            variant="contained"
            color="primary"
            onClick={handleAdd}
            data-cy="CreateHeadTag"
            startIcon={<AddIcon />}
            sx={{ mr: 1, minWidth: "185px" }}
          >
            {t("shell.headCreateTag")}
          </Button>
          <h3>
            <Notice>{t("shell.headNotVersionedNotice")}</Notice>
          </h3>
        </div>
        <div className={styles.Notice}>
          {legacyHeadTags?.length && (
            <Box component="h3">
              <Notice>{t("shell.headLegacyNotice")}</Notice>
            </Box>
          )}
        </div>
        {props.tags.length ? (
          props.tags
            .sort((a, b) => (a.sort > b.sort ? 1 : -1))
            .map((tag, index) => {
              return (
                <HeadTag key={index} tag={tag} dispatch={props.dispatch} />
              );
            })
        ) : (
          <h3 className={cx(styles.headline, styles.NoTags)}>
            {t("shell.headNoTags")}
          </h3>
        )}
      </main>

      <Preview
        item={props.item}
        instanceName={props.instanceName}
        domain={domain}
        tags={props.tags}
        legacyHeadTags={legacyHeadTags}
      />
    </div>
  );
});
