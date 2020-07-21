import React, { useMemo, useCallback } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { fetchFields } from "shell/store/fields";
import { fetchItem, fetchItems, searchItems } from "shell/store/content";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

// it would be nice to have a central import for all of these
// instead of individually importing
import { Url } from "@zesty-io/core/Url";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { FieldTypeColor } from "@zesty-io/core/FieldTypeColor";
import { FieldTypeNumber } from "@zesty-io/core/FieldTypeNumber";
import { FieldTypeUUID } from "@zesty-io/core/FieldTypeUUID";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeCurrency } from "@zesty-io/core/FieldTypeCurrency";
import { FieldTypeDate } from "@zesty-io/core/FieldTypeDate";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import { FieldTypeSort } from "@zesty-io/core/FieldTypeSort";
import { FieldTypeEditor } from "@zesty-io/core/FieldTypeEditor";
import { FieldTypeTinyMCE } from "@zesty-io/core/FieldTypeTinyMCE";
import { FieldTypeOneToOne } from "@zesty-io/core/FieldTypeOneToOne";
import { FieldTypeOneToMany } from "@zesty-io/core/FieldTypeOneToMany";

import styles from "./Field.less";

function sortTitle(a, b) {
  const nameA = String(a.text) && String(a.text).toUpperCase(); // ignore upper and lowercase
  const nameB = String(b.text) && String(b.text).toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
}
function sortHTML(a, b) {
  const nameA = String(a.html) && String(a.html).toUpperCase(); // ignore upper and lowercase
  const nameB = String(b.html) && String(b.html).toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
}

function resolveRelatedOptions(fields, items, fieldZUID, modelZUID) {
  // guard against absent data in state
  const field = fields && fields[fieldZUID];
  if (!field || !items) {
    return [];
  }

  return Object.keys(items)
    .filter(
      itemZUID =>
        items[itemZUID] &&
        items[itemZUID].meta &&
        items[itemZUID].meta.contentModelZUID === modelZUID
    )
    .map(itemZUID => {
      return {
        text: items[itemZUID].data[field.name],
        value: itemZUID
      };
    })
    .sort(sortTitle);
}

export default connect(state => {
  return {
    allItems: state.content,
    allFields: state.fields
  };
})(function Field(props) {
  const {
    ZUID,
    contentModelZUID,
    value,
    datatype,
    required,
    settings,
    label,
    description,
    name,
    relatedFieldZUID,
    relatedModelZUID,
    onChange,
    onSave,
    dispatch
  } = props;

  switch (datatype) {
    case "text":
    case "fontawesome":
      return (
        <FieldTypeText
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
        />
      );

    case "link":
      return (
        <FieldTypeText
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
          type="url"
        />
      );

    case "uuid":
      //Note we should generate the UUID here if one does not exist
      return (
        <FieldTypeUUID
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          placeholder="UUID field values are auto-generated"
          required={required}
          value={value}
          onChange={onChange} // Is used to set the UUID value on new item creation
        />
      );

    case "textarea":
      return (
        <FieldTypeTextarea
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
          maxLength="16000"
        />
      );
    case "wysiwyg_advanced":
    case "wysiwyg_basic":
      return (
        <div className={styles.WYSIWYGFieldType}>
          <FieldTypeTinyMCE
            name={name}
            label={label}
            description={description}
            tooltip={settings.tooltip}
            required={required}
            value={value}
            onChange={onChange}
            onSave={onSave}
            type={datatype}
            maxLength="16000"
            skin="oxide"
            skinURL="/vendors/tinymce/skins/ui/oxide"
            contentCSS="/vendors/tinymce/content.css"
            externalPlugins={{
              advcode: "/vendors/tinymce/plugins/advcode/plugin.js",
              powerpaste: "/vendors/tinymce/plugins/powerpaste/plugin.js",
              formatpainter: "/vendors/tinymce/plugins/formatpainter/plugin.js",
              pageembed: "/vendors/tinymce/plugins/pageembed/plugin.js"
            }}
          />
        </div>
      );
    case "markdown":
    case "article_writer":
      return (
        <div className={styles.WYSIWYGFieldType}>
          <FieldTypeEditor
            name={name}
            label={label}
            description={description}
            tooltip={settings.tooltip}
            required={required}
            value={value}
            onChange={onChange}
            type={datatype}
            maxLength="16000"
          />
        </div>
      );

    case "files":
    case "images":
      const images = useMemo(() => (value || "").split(",").filter(el => el), [
        value
      ]);
      return (
        <FieldTypeImage
          images={images}
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          limit={(settings && settings.limit) || 1}
          locked={(settings && settings.group_id) || null}
          onChange={onChange}
          value={value}
        />
      );

    case "yes_no":
      if (settings.options) {
        const binaryFieldOpts = Object.values(settings.options);

        return (
          <FieldTypeBinary
            name={name}
            label={label}
            description={description}
            tooltip={settings.tooltip}
            required={required}
            value={value}
            onChange={onChange}
            offValue={binaryFieldOpts[0]}
            onValue={binaryFieldOpts[1]}
          />
        );
      } else {
        return (
          <h1 style={{ color: "#e53c05" }}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            &nbsp;
            <Url href={`/schema/${contentModelZUID}/field/${ZUID}`}>
              The <em>{label}</em> field is missing option settings. Edit the
              field to add yes/no values.
            </Url>
          </h1>
        );
      }

    case "dropdown":
      const dropdownOptions = useMemo(() => {
        return settings.options
          ? Object.keys(settings.options).map(name => {
              return {
                value: name,
                text: settings.options[name]
              };
            })
          : [];
      }, [settings.options]);

      return (
        <FieldTypeDropDown
          description={description}
          tooltip={settings.tooltip}
          name={name}
          label={label}
          required={required}
          value={value}
          onChange={onChange}
          options={dropdownOptions}
        />
      );

    case "internal_link":
      let internalLinkRelatedItem = props.allItems[value];
      let internalLinkOptions = useMemo(() => {
        return Object.keys(props.allItems)
          .filter(
            itemZUID =>
              !itemZUID.includes("new") && // exclude new items
              props.allItems[itemZUID].meta.ZUID && // ensure the item has a zuid
              props.allItems[itemZUID].web.pathPart // exclude items non-routeable items
          )
          .map(itemZUID => {
            let item = props.allItems[itemZUID];
            let html = "";

            if (item.web.metaTitle) {
              html += `<strong style="display:block;font-weight:bold;">${item.web.metaTitle}</strong>`;
            } else {
              html += `<small style="display:block;font-weight:bold;"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;<a href="/content/${item.meta.contentModelZUID}/${itemZUID}">${itemZUID}</a> is missing a meta title</small>`;
            }

            if (item.web.path || item.web.pathPart) {
              html += `<small style="font-style:italic;">${item.web.path ||
                item.web.pathPart}</small>`;
            }

            return {
              value: itemZUID,
              html: html
            };
          })
          .sort(sortHTML);
      }, [internalLinkRelatedItem, Object.keys(props.allItems).length]);

      if (
        !internalLinkRelatedItem ||
        !internalLinkRelatedItem.meta ||
        !internalLinkRelatedItem.meta.ZUID
      ) {
        // insert placeholder
        internalLinkOptions.unshift({
          value: value,
          text: `Related item: ${value}`
        });

        // load related item from API
        if (value && value != "0") {
          dispatch(searchItems(value));
        }
      }

      const onInternalLinkSearch = useCallback(
        term => dispatch(searchItems(term)),
        []
      );

      return (
        <FieldTypeInternalLink
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
          onSearch={onInternalLinkSearch}
          options={internalLinkOptions}
        />
      );

    case "one_to_one":
      let oneToOneOptions = useMemo(() => {
        return resolveRelatedOptions(
          props.allFields,
          props.allItems,
          relatedFieldZUID,
          relatedModelZUID
        );
      }, [
        Object.keys(props.allFields).length,
        Object.keys(props.allItems).length,
        relatedModelZUID,
        relatedFieldZUID
      ]);

      // If the initial value doesn't exist in local store load from API
      if (value && (!props.allItems[value] || !props.allItems[value].meta)) {
        if (relatedModelZUID && value) {
          if (value != "0") {
            dispatch(fetchItem(relatedModelZUID, value));
          }
        }
      }
      if (value && !oneToOneOptions.find(opt => opt.value === value)) {
        //the related option is not in the array, we need ot insert it
        oneToOneOptions.unshift({
          value: value,
          text: `Related item: ${value}`
        });
      }

      const onOneToOneOpen = useCallback(
        () => Promise.resolve(dispatch(fetchItems(relatedModelZUID))),
        []
      );

      return (
        <FieldTypeOneToOne
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
          options={oneToOneOptions}
          onOpen={onOneToOneOpen}
        />
      );

    case "one_to_many":
      //TODO: we need to implement specific fetches for items
      // when an endpoint is available for that purpose
      // if (value) {
      //   const resolved = resolveRelatedOptions(
      //     props.allFields,
      //     props.allItems,
      //     relatedFieldZUID,
      //     relatedModelZUID
      //   );
      //   if (value.split(",").length > resolved.length) {
      //     dispatch(fetchFields(relatedModelZUID));
      //     dispatch(fetchItems(relatedModelZUID));
      //   }
      // }

      const oneToManyOptions = useMemo(() => {
        return resolveRelatedOptions(
          props.allFields,
          props.allItems,
          relatedFieldZUID,
          relatedModelZUID
        );
      }, [
        Object.keys(props.allFields).length,
        Object.keys(props.allItems).length,
        relatedModelZUID,
        relatedFieldZUID
      ]);

      // Delay loading options until user opens dropdown
      const onOneToManyOpen = useCallback(() => {
        return Promise.all([
          dispatch(fetchFields(relatedModelZUID)),
          dispatch(fetchItems(relatedModelZUID))
        ]);
      }, []);

      return (
        <FieldTypeOneToMany
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
          relatedModelZUID={relatedModelZUID}
          options={oneToManyOptions}
          onOpen={onOneToManyOpen}
        />
      );

    case "color":
      return (
        <FieldTypeColor
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
        />
      );

    case "number":
      return (
        <FieldTypeNumber
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={Number(value) ? Number(value) : 0}
          onChange={onChange}
        />
      );

    case "currency":
      return (
        <FieldTypeCurrency
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          placeholder="0.00"
          required={required}
          value={value}
          onChange={onChange}
        />
      );

    case "date":
    case "datetime":
      /**
       * Every time this parent compenent re-renders it creates a new function
       * invalidating the FieldTypeData components referential prop check,
       * causing it to re-render as well. This `onChange` handler doesn't need
       * to change once created.
       */
      const onDateChange = useCallback((value, name, datatype) => {
        /**
         * Flatpickr emits a utc timestamp, offset from users local time.
         * Legacy behavior did not send utc but sent the value as is selected by the user
         * this ensures that behavior is maintained
         */
        onChange(moment(value).format("YYYY-MM-DD HH:mm:ss"), name, datatype);
      }, []);

      return (
        <FieldTypeDate
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          datatype={datatype}
          required={required}
          value={value}
          onChange={onDateChange}
        />
      );

    case "sort":
      return (
        <FieldTypeSort
          name={name}
          label={label}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <Url href={`/schema/${contentModelZUID}/field/${ZUID}`}>
          Failed loading {label} field. Click here to view field schema.
        </Url>
      );
  }
});
