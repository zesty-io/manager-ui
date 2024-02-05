import {
  memo,
  Fragment,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { MetaTitle } from "./settings/MetaTitle";
import MetaDescription from "./settings/MetaDescription";
import { MetaKeywords } from "./settings/MetaKeywords";
import { MetaLinkText } from "./settings/MetaLinkText";
import { ItemRoute } from "./settings/ItemRoute";
import { ContentInsights } from "./ContentInsights";
import { ItemParent } from "./settings/ItemParent";
import { CanonicalTag } from "./settings/CanonicalTag";
import { SitemapPriority } from "./settings/SitemapPriority";
import { useDomain } from "shell/hooks/use-domain";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import SearchIcon from "@mui/icons-material/Search";

import styles from "./ItemSettings.less";
import { fetchGlobalItem } from "../../../../../../../../shell/store/content";

export const MaxLengths = {
  metaLinkText: 150,
  metaTitle: 150,
  metaDescription: 160,
  metaKeywords: 255,
};

export const ItemSettings = memo(
  function ItemSettings(props) {
    const showSiteNameInMetaTitle = useSelector(
      (state) =>
        state.settings.instance.find(
          (setting) => setting.key === "show_in_title"
        )?.value
    );
    const dispatch = useDispatch();
    const domain = useDomain();
    let { data, meta, web } = props.item;
    const [errors, setErrors] = useState({});

    data = data || {};
    meta = meta || {};
    web = web || {};

    const siteName = useMemo(() => dispatch(fetchGlobalItem())?.site_name, []);

    const onChange = useCallback(
      (value, name) => {
        if (!name) {
          throw new Error("Input is missing name attribute");
        }

        if (MaxLengths[name]) {
          setErrors({
            ...errors,
            [name]: {
              EXCEEDING_MAXLENGTH:
                value?.length > MaxLengths[name]
                  ? value?.length - MaxLengths[name]
                  : 0,
            },
          });
        }

        props.dispatch({
          type: "SET_ITEM_WEB",
          itemZUID: meta.ZUID,
          key: name,
          value: value,
        });
      },
      [meta.ZUID, errors]
    );

    useEffect(() => {
      if (props.saving) {
        setErrors({});
        return;
      }
    }, [props.saving]);

    return (
      <section className={styles.Meta}>
        <main className={styles.MetaMain}>
          {web.pathPart !== "zesty_home" && (
            <Fragment>
              <ItemParent
                itemZUID={meta.ZUID}
                modelZUID={props.modelZUID}
                parentZUID={web.parentZUID}
                path={web.path}
                onChange={onChange}
                currentItemLangID={props.item.meta.langID}
              />
              <ItemRoute
                ZUID={meta.ZUID}
                meta={meta}
                parentZUID={web.parentZUID}
                path_part={web.pathPart}
                path_to={web.path}
              />
            </Fragment>
          )}
          <MetaLinkText
            meta_link_text={web.metaLinkText}
            onChange={onChange}
            errors={errors}
            isSaving={props.saving}
          />
          <MetaTitle
            meta_title={web.metaTitle}
            onChange={onChange}
            errors={errors}
            isSaving={props.saving}
          />
          <MetaDescription
            meta_description={web.metaDescription}
            onChange={onChange}
            errors={errors}
            isSaving={props.saving}
          />
          <MetaKeywords
            meta_keywords={web.metaKeywords}
            onChange={onChange}
            errors={errors}
            isSaving={props.saving}
          />
          <SitemapPriority
            sitemapPriority={web.sitemapPriority}
            onChange={onChange}
          />
          {props.item && (
            <CanonicalTag
              mode={web.canonicalTagMode}
              whitelist={web.canonicalQueryParamWhitelist}
              custom={web.canonicalTagCustomValue}
              onChange={onChange}
            />
          )}
        </main>
        <aside className={styles.MetaSide}>
          <Card
            sx={{ mb: 2, border: 1, borderColor: "grey.100" }}
            variant="outlined"
          >
            <CardHeader
              avatar={
                <SearchIcon fontSize="small" sx={{ fill: "#10182866" }} />
              }
              title="Example Search Engine Listing"
              sx={{
                backgroundColor: "grey.100",
              }}
              titleTypographyProps={{
                sx: {
                  color: "text.primary",
                },
              }}
            ></CardHeader>
            <CardContent>
              <div className={styles.SearchResult}>
                <h6 className={styles.GoogleTitle}>
                  {web.metaTitle}
                  {Boolean(Number(showSiteNameInMetaTitle))
                    ? ` | ${siteName}`
                    : ""}
                </h6>
                <div className={styles.GoogleLink}>
                  {domain ? (
                    <a
                      id="google-link-example"
                      target="_blank"
                      href={`${domain}${web.path ? web.path : "/"}`}
                    >
                      {`${domain}${web.path ? web.path : "/"}`}
                    </a>
                  ) : null}

                  <span className={styles.Icon} />
                </div>
                <p className={styles.GoogleDesc}>
                  {web.metaDescription && web.metaDescription.substr(0, 160)}
                </p>
              </div>
            </CardContent>
          </Card>
          <ContentInsights content={props.item.data} meta={props.item.web} />
        </aside>
      </section>
    );
  },
  (prevProps, nextProps) => {
    // NOTE We want to update children when the `item` changes but only when `content` length changes

    // If the model we are viewing changes we need to re-render
    if (prevProps.modelZUID !== nextProps.modelZUID) {
      return false;
    }

    // If the item referential equailty of the item changes we want to re-render
    // should mean the item has updated data
    if (prevProps.item !== nextProps.item) {
      return false;
    }

    // Avoid referential equality check and compare content length to see if new ones where added
    let prevItemsLen = Object.keys(prevProps["content"]).length;
    let nextItemsLen = Object.keys(nextProps["content"]).length;
    if (prevItemsLen !== nextItemsLen) {
      return false;
    }

    /**
     * We ignore changes to the `instance` object and `dispatch`
     * as these values should not change.
     */

    return true;
  }
);
