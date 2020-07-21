import React, { useCallback } from "react";

import { MetaTitle } from "./settings/MetaTitle";
import { MetaDescription } from "./settings/MetaDescription";
import { MetaKeywords } from "./settings/MetaKeywords";
import { MetaLinkText } from "./settings/MetaLinkText";
import { ItemRoute } from "./settings/ItemRoute";
import { ItemParent } from "./settings/ItemParent";
import { CanonicalTag } from "./settings/CanonicalTag";
import { SitemapPriority } from "./settings/SitemapPriority";

import styles from "./ItemSettings.less";

export const ItemSettings = React.memo(
  function ItemSettings(props) {
    let { data, meta, web } = props.item;

    data = data || {};
    meta = meta || {};
    web = web || {};

    const onChange = useCallback(
      (name, value) => {
        if (!name) {
          throw new Error("Input is missing name attribute");
        }
        props.dispatch({
          type: "SET_ITEM_WEB",
          itemZUID: meta.ZUID,
          key: name,
          value: value
        });
      },
      [meta.ZUID]
    );

    return (
      <section className={styles.Meta}>
        <main className={styles.Settings}>
          {web.pathPart !== "zesty_home" && (
            <React.Fragment>
              <ItemParent
                itemZUID={meta.ZUID}
                modelZUID={props.modelZUID}
                content={props.content}
                parentZUID={web.parentZUID}
                path={web.path}
                onChange={onChange}
              />
              <ItemRoute
                ZUID={meta.ZUID}
                meta={meta}
                path_part={web.pathPart}
                path_to={web.path}
                dispatch={props.dispatch}
              />
            </React.Fragment>
          )}
          <MetaLinkText meta_link_text={web.metaLinkText} onChange={onChange} />
          <MetaTitle meta_title={web.metaTitle} onChange={onChange} />
          <MetaDescription
            meta_description={web.metaDescription}
            onChange={onChange}
          />
          <MetaKeywords meta_keywords={web.metaKeywords} onChange={onChange} />
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
        <aside className={styles.GoogleListing}>
          <h6 className={styles.title}>Example Search Engine Listing</h6>
          <div className={styles.SearchResult}>
            <h6 className={styles.GoogleTitle}>{web.metaTitle}</h6>
            <div className={styles.GoogleLink}>
              <a id="google-link-example" href="javascript:void(0)">
                {`${props.instance.live_domain ||
                  props.instance.preview_domain}${web.path ? web.path : ""}`}
              </a>
              <span className={styles.Icon} />
            </div>
            <p className={styles.GoogleDesc}>
              {web.metaDescription && web.metaDescription.substr(0, 160)}
            </p>
          </div>
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
