import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import zuid from "zuid";

import { FieldTypeInternalLink } from "../../../../../../../shell/components/FieldTypeInternalLink";
import { AppState } from "../../../../../../../shell/store/types";
import { useCallback, useEffect, useMemo } from "react";
import { searchItems } from "../../../../../../../shell/store/content";
import { LinkOption } from "./LinkOption";
import { sortHTML } from "./Field";

type InternalLinkProps = {
  name: string;
  value: string;
  onChange: (value: any, name: string, datatype?: string) => void;
  error: boolean;
  langID: number;
};
export const InternalLink = ({
  name,
  value,
  onChange,
  error,
  langID,
}: InternalLinkProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation("content");

  const allItems = useSelector((state: AppState) => state.content);
  let internalLinkRelatedItem = allItems[value];

  useEffect(() => {
    // Resolve the itemZUID in case it isn't in the store cache
    if (
      !internalLinkRelatedItem &&
      zuid.isValid(value) &&
      zuid.matches(value, zuid.prefix["SITE_CONTENT_ITEM"])
    ) {
      dispatch(searchItems(value));
    }
  }, [internalLinkRelatedItem, value, dispatch]);
  let internalLinkOptions = useMemo(() => {
    const options = Object.keys(allItems)
      .filter(
        (itemZUID) =>
          !itemZUID.includes("new") && // exclude new items
          allItems[itemZUID].meta.ZUID && // ensure the item has a zuid
          allItems[itemZUID].web.pathPart && // exclude non-routeable items
          allItems[itemZUID].meta.langID === langID // exclude non-relevant langs
      )
      .map((itemZUID) => {
        let item = allItems[itemZUID];
        let html = "";

        if (item.web.metaTitle) {
          html += `<strong style="display:block;font-weight:bold;">${item.web.metaTitle}</strong>`;
        } else {
          return {
            component: (
              <LinkOption
                modelZUID={item.meta.contentModelZUID}
                itemZUID={itemZUID}
              />
            ),
          };
        }

        if (item.web.path || item.web.pathPart) {
          html += `<small style="font-style:italic;">${
            item.web.path || item.web.pathPart
          }</small>`;
        }

        return {
          value: itemZUID,
          html: html,
        };
      })
      .sort(sortHTML);

    // if the selected item is not found, insert a placeholder
    if (internalLinkRelatedItem && !internalLinkRelatedItem?.meta?.ZUID) {
      // insert placeholder
      options.unshift({
        value: value as string,
        html: t("content.selectedItemNotFound", { value }),
      });
    }

    return options;
  }, [internalLinkRelatedItem, Object.keys(allItems).length, t]);

  const onInternalLinkSearch = useCallback(
    (term) => dispatch(searchItems(term)),
    []
  );

  return (
    <FieldTypeInternalLink
      // @ts-ignore component not typed
      name={name}
      value={value}
      onChange={onChange}
      onSearch={onInternalLinkSearch}
      options={internalLinkOptions}
      error={error}
    />
  );
};
