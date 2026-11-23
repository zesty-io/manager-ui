import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

import { Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Notice } from "shell/components/legacy/Notice";

import { HeadTag } from "./HeadTag";
import { Preview } from "./Preview";

import { fetchHeadTags, addHeadTag } from "shell/store/headTags";
import { useDomain } from "shell/hooks/use-domain";
import { useGetLegacyHeadTagsQuery } from "../../services/instance";

const noticeSx = {
  display: "flex",
  alignItems: "center",
  mt: 2.5,
  mr: 2,
  mb: 4,
  ml: 0,
  color: "text.secondary",
  typography: "body2",
  lineHeight: "inherit",
  letterSpacing: "inherit",
};

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
    <Box
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(400px, 1fr) 1fr",
      }}
    >
      <Box sx={{ height: "100%", overflowY: "auto" }}>
        <Box sx={noticeSx}>
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
        </Box>
        <Box sx={noticeSx}>
          {legacyHeadTags?.length && (
            <Box component="h3">
              <Notice>{t("shell.headLegacyNotice")}</Notice>
            </Box>
          )}
        </Box>
        {props.tags.length ? (
          props.tags
            .sort((a, b) => (a.sort > b.sort ? 1 : -1))
            .map((tag, index) => {
              return (
                <HeadTag key={index} tag={tag} dispatch={props.dispatch} />
              );
            })
        ) : (
          <Box
            component="h3"
            sx={{
              typography: "h3",
              fontWeight: 200,
              lineHeight: "42px",
              letterSpacing: "0.32px",
              m: 4,
            }}
          >
            {t("shell.headNoTags")}
          </Box>
        )}
      </Box>

      <Preview
        item={props.item}
        instanceName={props.instanceName}
        domain={domain}
        tags={props.tags}
        legacyHeadTags={legacyHeadTags}
      />
    </Box>
  );
});
