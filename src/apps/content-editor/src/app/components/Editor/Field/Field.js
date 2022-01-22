import { memo, useMemo, useCallback, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import zuid from "zuid";

import { fetchFields } from "shell/store/fields";
import { fetchItem, fetchItems, searchItems } from "shell/store/content";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
// it would be nice to have a central import for all of these
// instead of individually importing
import { AppLink } from "@zesty-io/core/AppLink";
import { Modal } from "@zesty-io/core/Modal";
import MediaApp from "../../../../../../media/src/app/MediaApp";
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
import MediaStyles from "../../../../../../media/src/app/MediaAppModal.less";

const FieldLabel = memo((props) => {
  return (
    <>
      <span className={styles.MainLabel}>{props.label}&nbsp;</span>
      <span className={styles.SubLabel}>
        {props.datatype}: {props.name}
      </span>
    </>
  );
});

// NOTE: Componetized so it can be memoized for input/render perf
const ResolvedOption = memo((props) => {
  return (
    <span className={styles.ResolvedOption}>
      <span onClick={(evt) => evt.stopPropagation()}>
        <AppLink
          className={styles.relatedItemLink}
          to={`/content/${props.modelZUID}/${props.itemZUID}`}
        >
          <FontAwesomeIcon icon={faEdit} />
        </AppLink>
      </span>
      &nbsp;{props.html}
    </span>
  );
});

// NOTE: Componetized so it can be memoized for input/render perf
const LinkOption = memo((props) => {
  return (
    <>
      <FontAwesomeIcon icon={faExclamationTriangle} />
      &nbsp;
      <AppLink to={`/content/${props.modelZUID}/${props.itemZUID}`}>
        {props.itemZUID}
      </AppLink>
      <strong>&nbsp;is missing a meta title</strong>
    </>
  );
});

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

function resolveRelatedOptions(
  fields,
  items,
  fieldZUID,
  modelZUID,
  langID,
  value
) {
  // guard against absent data in state
  const field = fields && fields[fieldZUID];
  if (!field || !items) {
    return [];
  }

  return Object.keys(items)
    .filter((itemZUID) => {
      return (
        items[itemZUID] &&
        items[itemZUID].meta &&
        items[itemZUID].meta.contentModelZUID === modelZUID &&
        // filter by content language
        (langID === items[itemZUID].meta.langID ||
          // ...unless option already selected
          value?.split(",").includes(itemZUID))
      );
    })
    .map((itemZUID) => {
      // Matching ItemZUID to languageZUID to get language code {key} to display in dropdown
      let langCode = "";
      if (items[itemZUID].siblings) {
        const match = Object.entries(items[itemZUID].siblings).find(
          (arr) => items[itemZUID].meta.ZUID === arr[1]
        );
        if (match) {
          langCode = match[0];
        }
      }

      return {
        filterValue: items[itemZUID].data[field.name],
        value: itemZUID,
        component: (
          <ResolvedOption
            modelZUID={modelZUID}
            itemZUID={itemZUID}
            html={
              <>
                <span>{items[itemZUID].data[field.name]}</span>
                <em className={styles.Language}>&nbsp;{langCode}</em>
              </>
            }
          />
        ),
      };
    })
    .sort(sortTitle);
}

const getSelectedLang = (langs, langID) =>
  langs.find((lang) => lang.ID === langID).code;

export default function Field({
  ZUID,
  contentModelZUID,
  item,
  datatype,
  required,
  settings,
  label,
  description,
  name,
  relatedFieldZUID,
  relatedModelZUID,
  langID,
  onChange,
  onSave,
}) {
  const dispatch = useDispatch();
  const allItems = useSelector((state) => state.content);
  const allFields = useSelector((state) => state.fields);
  const allLanguages = useSelector((state) => state.languages);

  const [imageModal, setImageModal] = useState();

  const value = item?.data?.[name];
  const version = item?.meta?.version;

  useEffect(() => {
    if (value && typeof value === "string") {
      value.split(",").forEach((z) => {
        if (zuid.isValid(z) && !zuid.matches(z, zuid.prefix["MEDIA_FILE"])) {
          dispatch(searchItems(z));
        }
      });
    }
  }, []);

  function renderMediaModal() {
    return ReactDOM.createPortal(
      <Modal
        open={true}
        type="global"
        onClose={() => setImageModal()}
        className={MediaStyles.MediaAppModal}
      >
        <MediaApp
          limitSelected={imageModal.limit}
          modal={true}
          addImages={(images) => {
            imageModal.callback(images);
            setImageModal();
          }}
        />
      </Modal>,
      document.getElementById("modalMount")
    );
  }

  // NOTE: stablize label, large perf improvement
  const FieldTypeLabel = useMemo(
    () => <FieldLabel label={label} name={name} datatype={datatype} />,
    [label, name, datatype]
  );

  switch (datatype) {
    case "text":
    case "fontawesome":
      return (
        <FieldTypeText
          name={name}
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          version={version}
          datatype={datatype}
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
            label={FieldTypeLabel}
            description={description}
            tooltip={settings.tooltip}
            required={required}
            value={value}
            version={version}
            onChange={onChange}
            onSave={onSave}
            datatype={datatype}
            maxLength="16000"
            skin="oxide"
            skinURL="/vendors/tinymce/skins/ui/oxide"
            contentCSS="/vendors/tinymce/content.css"
            externalPlugins={{
              advcode: "/vendors/tinymce/plugins/advcode/plugin.js",
              powerpaste: "/vendors/tinymce/plugins/powerpaste/plugin.js",
              formatpainter: "/vendors/tinymce/plugins/formatpainter/plugin.js",
              pageembed: "/vendors/tinymce/plugins/pageembed/plugin.js",
            }}
            mediaBrowser={(opts) => {
              setImageModal(opts);
            }}
          />
          {imageModal && renderMediaModal()}
        </div>
      );

    case "markdown":
    case "article_writer":
      return (
        <div className={styles.WYSIWYGFieldType}>
          <FieldTypeEditor
            name={name}
            label={FieldTypeLabel}
            description={description}
            tooltip={settings.tooltip}
            required={required}
            value={value}
            version={version}
            onChange={onChange}
            datatype={datatype}
            maxLength="16000"
            mediaBrowser={(opts) => {
              setImageModal(opts);
            }}
          />
          {imageModal && renderMediaModal()}
        </div>
      );

    case "files":
    case "images":
      const images = useMemo(
        () => (value || "").split(",").filter((el) => el),
        [value]
      );
      const mediaAppProps = {};
      if (settings && settings.group_id && settings.group_id !== "0") {
        mediaAppProps.groupID = settings.group_id;
      }
      return (
        <>
          <FieldTypeImage
            images={images}
            name={name}
            label={FieldTypeLabel}
            description={description}
            tooltip={settings.tooltip}
            required={required}
            limit={(settings && settings.limit) || 1}
            locked={Boolean(
              settings && settings.group_id && settings.group_id != "0"
            )}
            onChange={onChange}
            value={value}
            resolveImage={(zuid, width, height) =>
              `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${width}&h=${height}&type=fit`
            }
            mediaBrowser={(opts) => {
              setImageModal(opts);
            }}
          />
          {imageModal && (
            <Modal
              open={true}
              type="global"
              onClose={() => setImageModal()}
              className={MediaStyles.MediaAppModal}
            >
              <MediaApp
                {...mediaAppProps}
                limitSelected={imageModal.limit - images.length}
                modal={true}
                addImages={(images) => {
                  imageModal.callback(images);
                  setImageModal();
                }}
              />
            </Modal>
          )}
        </>
      );

    case "yes_no":
      if (settings.options) {
        const binaryFieldOpts = Object.values(settings.options);

        return (
          <FieldTypeBinary
            name={name}
            label={FieldTypeLabel}
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
            <AppLink to={`/schema/${contentModelZUID}/field/${ZUID}`}>
              The <em>{label}</em> field is missing option settings. Edit the
              field to add yes/no values.
            </AppLink>
          </h1>
        );
      }

    case "dropdown":
      const dropdownOptions = useMemo(() => {
        return settings.options
          ? Object.keys(settings.options).map((name) => {
              return {
                value: name,
                text: settings.options[name],
              };
            })
          : [];
      }, [settings.options]);

      return (
        <FieldTypeDropDown
          description={description}
          tooltip={settings.tooltip}
          name={name}
          label={FieldTypeLabel}
          required={required}
          value={value}
          onChange={onChange}
          options={dropdownOptions}
        />
      );

    case "internal_link":
      let internalLinkRelatedItem = allItems[value];
      let internalLinkOptions = useMemo(() => {
        return Object.keys(allItems)
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
      }, [internalLinkRelatedItem, Object.keys(allItems).length]);

      if (
        !internalLinkRelatedItem ||
        !internalLinkRelatedItem.meta ||
        !internalLinkRelatedItem.meta.ZUID
      ) {
        // insert placeholder
        internalLinkOptions.unshift({
          value: value,
          text: `Related item: ${value}`,
        });
      }

      const onInternalLinkSearch = useCallback(
        (term) => dispatch(searchItems(term)),
        []
      );

      return (
        <FieldTypeInternalLink
          name={name}
          label={FieldTypeLabel}
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
      const onOneToOneOpen = useCallback(() => {
        return dispatch(
          fetchItems(relatedModelZUID, {
            lang: getSelectedLang(allLanguages, langID),
          })
        );
      }, [allLanguages.length, relatedModelZUID, langID]);

      let oneToOneOptions = useMemo(() => {
        return resolveRelatedOptions(
          allFields,
          allItems,
          relatedFieldZUID,
          relatedModelZUID,
          langID,
          value
        );
      }, [
        Object.keys(allFields).length,
        Object.keys(allItems).length,
        relatedModelZUID,
        relatedFieldZUID,
        langID,
        value,
      ]);

      if (
        value &&
        value != "0" &&
        !oneToOneOptions.find((opt) => opt.value === value)
      ) {
        //the related option is not in the array, we need ot insert it
        oneToOneOptions.unshift({
          filterValue: value,
          value: value,
          component: (
            <span>
              <span onClick={(evt) => evt.stopPropagation()}>
                <AppLink
                  className={styles.relatedItemLink}
                  to={`/content/${relatedModelZUID}/${value}`}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </AppLink>
              </span>
              &nbsp;Selected item: {value}
            </span>
          ),
        });
      }

      return (
        <FieldTypeOneToOne
          className={styles.FieldTypeOneToOne}
          name={name}
          label={FieldTypeLabel}
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
      const oneToManyOptions = useMemo(() => {
        return resolveRelatedOptions(
          allFields,
          allItems,
          relatedFieldZUID,
          relatedModelZUID,
          langID,
          value
        );
      }, [
        Object.keys(allFields).length,
        Object.keys(allItems).length,
        relatedModelZUID,
        relatedFieldZUID,
        langID,
        value,
      ]);

      // Delay loading options until user opens dropdown
      const onOneToManyOpen = useCallback(() => {
        return Promise.all([
          dispatch(fetchFields(relatedModelZUID)),
          dispatch(
            fetchItems(relatedModelZUID, {
              lang: getSelectedLang(allLanguages, langID),
            })
          ),
        ]);
      }, [allLanguages.length, relatedModelZUID, langID]);

      return (
        <FieldTypeOneToMany
          className={styles.FieldTypeOneToMany}
          name={name}
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
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
          label={FieldTypeLabel}
          description={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <AppLink to={`/schema/${contentModelZUID}/field/${ZUID}`}>
          Failed loading {label} field. Click here to view field schema.
        </AppLink>
      );
  }
}
