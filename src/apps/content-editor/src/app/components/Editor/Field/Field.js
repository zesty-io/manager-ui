import { memo, useMemo, useCallback, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import zuid from "zuid";

import { fetchFields } from "shell/store/fields";
import { fetchItems, searchItems } from "shell/store/content";

import {
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  FormLabel,
  Tooltip,
  Box,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Chip,
  TextField,
  Dialog,
  IconButton,
} from "@mui/material";

import InfoIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
// it would be nice to have a central import for all of these
// instead of individually importing
import { AppLink } from "@zesty-io/core/AppLink";
import { MediaApp } from "../../../../../../media/src/app";
import { FieldTypeUUID } from "@zesty-io/core/FieldTypeUUID";
import { FieldTypeCurrency } from "@zesty-io/core/FieldTypeCurrency";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import { FieldTypeEditor } from "@zesty-io/core/FieldTypeEditor";
import { FieldTypeTinyMCE } from "@zesty-io/core/FieldTypeTinyMCE";
import {
  FieldTypeColor,
  FieldTypeOneToOne,
  FieldTypeOneToMany,
  FieldTypeText,
  FieldTypeDate,
  FieldTypeDateTime,
  FieldTypeSort,
} from "@zesty-io/material";

import styles from "./Field.less";
import { MemoryRouter } from "react-router";
import { withAI } from "../../../../../../../shell/components/withAi";

const AITextField = withAI(FieldTypeText);
const AIEditorField = withAI(FieldTypeEditor);
const AITinyMCEField = withAI(FieldTypeTinyMCE);

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
        inputLabel: items[itemZUID].data[field.name] || "",
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
    if (datatype !== "date" && datatype !== "datetime") {
      if (value && typeof value === "string") {
        value.split(",").forEach((z) => {
          if (zuid.isValid(z) && !zuid.matches(z, zuid.prefix["MEDIA_FILE"])) {
            dispatch(searchItems(z));
          }
        });
      }
    }
  }, []);

  function renderMediaModal() {
    return ReactDOM.createPortal(
      <MemoryRouter>
        <Dialog
          open
          fullScreen
          sx={{ my: 2.5, mx: 10 }}
          PaperProps={{
            style: {
              borderRadius: "4px",
            },
          }}
          onClose={() => setImageModal()}
        >
          <IconButton
            sx={{
              position: "fixed",
              right: 15,
              top: 10,
            }}
            onClick={() => setImageModal()}
          >
            <CloseIcon sx={{ color: "common.white" }} />
          </IconButton>
          <MediaApp
            limitSelected={imageModal.limit}
            isSelectDialog={true}
            addImagesCallback={(images) => {
              imageModal.callback(images);
              setImageModal();
            }}
          />
        </Dialog>
      </MemoryRouter>,
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
      return (
        <AITextField
          name={name}
          label={FieldTypeLabel}
          helperText={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={(evt) => onChange(evt.target.value, name)}
          aiType="text"
        />
      );
    case "fontawesome":
      return (
        <FieldTypeText
          name={name}
          label={FieldTypeLabel}
          helperText={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={(evt) => onChange(evt.target.value, name)}
        />
      );

    case "link":
      return (
        <FieldTypeText
          name={name}
          label={FieldTypeLabel}
          helperText={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          onChange={(evt) => onChange(evt.target.value, name)}
          type="url"
          maxLength={2000}
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
        <AITextField
          name={name}
          label={FieldTypeLabel}
          helperText={description}
          tooltip={settings.tooltip}
          required={required}
          value={value}
          version={version}
          datatype={datatype}
          multiline={true}
          rows={6}
          aiType="paragraph"
          onChange={(evt) => {
            onChange(evt.target.value, name);
          }}
          maxLength="16000"
        />
      );

    case "wysiwyg_advanced":
    case "wysiwyg_basic":
      return (
        <div className={styles.WYSIWYGFieldType}>
          <AITinyMCEField
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
            aiType="paragraph"
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
          <AIEditorField
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
            aiType="paragraph"
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
            <MemoryRouter>
              <Dialog
                open
                fullScreen
                sx={{ my: 2.5, mx: 10 }}
                PaperProps={{
                  style: {
                    borderRadius: "4px",
                  },
                }}
                onClose={() => setImageModal()}
              >
                <IconButton
                  sx={{
                    position: "fixed",
                    right: 5,
                    top: 0,
                  }}
                  onClick={() => setImageModal()}
                >
                  <CloseIcon sx={{ color: "common.white" }} />
                </IconButton>
                <MediaApp
                  limitSelected={imageModal.limit - images.length}
                  isSelectDialog={true}
                  showHeaderActions={false}
                  lockedToGroupId={
                    settings?.group_id && settings?.group_id !== "0"
                      ? settings.group_id
                      : null
                  }
                  addImagesCallback={(images) => {
                    imageModal.callback(images);
                    setImageModal();
                  }}
                />
              </Dialog>
            </MemoryRouter>
          )}
        </>
      );

    case "yes_no":
      if (settings.options) {
        const binaryFieldOpts = Object.values(settings.options);
        return (
          <FormControl required={required}>
            <FormLabel>
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                {settings.tooltip ? (
                  <Tooltip
                    placement="top-start"
                    arrow
                    title={settings.tooltip ? settings.tooltip : " "}
                  >
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                ) : (
                  " "
                )}
                {FieldTypeLabel}
              </Box>
            </FormLabel>
            <ToggleButtonGroup
              color="secondary"
              size="small"
              value={value}
              exclusive
              onChange={(e, val) => onChange(val, name)}
            >
              <ToggleButton value={0}>
                {binaryFieldOpts[0] || "No"}{" "}
              </ToggleButton>
              <ToggleButton value={1}>
                {binaryFieldOpts[1] || "Yes"}{" "}
              </ToggleButton>
            </ToggleButtonGroup>
            <Box component="p" sx={{ mt: 1 }}>
              {description}
            </Box>
          </FormControl>
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
        <FormControl fullWidth required={required} size="small">
          <FormLabel>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" />
                </Tooltip>
              ) : (
                " "
              )}
              {FieldTypeLabel}
            </Box>
          </FormLabel>
          <Select
            name={name}
            variant="outlined"
            displayEmpty
            value={value || ""}
            onChange={(e) => onChange(e.target.value, name)}
          >
            <MenuItem value="">- None -</MenuItem>
            {dropdownOptions.map((dropdownOption, idx) => (
              <MenuItem key={idx} value={dropdownOption.value}>
                {dropdownOption.text}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{description}</FormHelperText>
        </FormControl>
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
          text: `Selected item not found: ${value}`,
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
        return [
          {
            inputLabel: "- None -",
            value: "0",
            component: "- None -",
          },
          ...resolveRelatedOptions(
            allFields,
            allItems,
            relatedFieldZUID,
            relatedModelZUID,
            langID,
            value
          ),
        ];
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
        //the related option is not in the array, we need to insert it
        oneToOneOptions.unshift({
          filterValue: value,
          value: value,
          inputLabel: `Selected item not found: ${value}`,
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
              &nbsp;Selected item not found: {value}
            </span>
          ),
        });
      }

      return (
        <FieldTypeOneToOne
          name={name}
          label={
            <Stack direction="row" alignItems="center">
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
              ) : (
                " "
              )}

              {FieldTypeLabel}
            </Stack>
          }
          helperText={description}
          required={required}
          placeholder={"Select relationship..."}
          value={
            oneToOneOptions?.find((options) => options.value === value) || null
          }
          onChange={(_, option) => onChange(option.value, name)}
          options={oneToOneOptions}
          onOpen={onOneToOneOpen}
          startAdornment={
            value &&
            value !== "0" && (
              <AppLink to={`/content/${relatedModelZUID}/${value}`}>
                <FontAwesomeIcon icon={faEdit} />
              </AppLink>
            )
          }
          endAdornment={
            value &&
            value !== "0" && <em>{getSelectedLang(allLanguages, langID)}</em>
          }
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
          name={name}
          label={
            <Stack direction="row" alignItems="center">
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
              ) : (
                " "
              )}

              {FieldTypeLabel}
            </Stack>
          }
          helperText={description}
          required={required}
          placeholder={"Select relationships..."}
          value={
            (value &&
              value
                ?.split(",")
                ?.map(
                  (value) =>
                    oneToManyOptions?.find(
                      (options) => options.value === value
                    ) || { value, inputLabel: value, component: value }
                )) ||
            []
          }
          onChange={(_, options) =>
            onChange(options.map((option) => option.value).join(","), name)
          }
          options={oneToManyOptions}
          onOpen={onOneToManyOpen}
          renderTags={(tags, getTagProps) =>
            tags.map((tag, index) => (
              <Chip
                size="small"
                label={tag.component}
                {...getTagProps({ index })}
              />
            ))
          }
        />
      );

    case "color":
      return (
        <Box sx={{ width: "300px" }}>
          <FieldTypeColor
            name={name}
            label={
              <Stack direction="row" alignItems="center">
                {settings.tooltip ? (
                  <Tooltip
                    placement="top-start"
                    arrow
                    title={settings.tooltip ? settings.tooltip : " "}
                  >
                    <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                  </Tooltip>
                ) : (
                  " "
                )}

                {FieldTypeLabel}
              </Stack>
            }
            helperText={description}
            required={required}
            value={value || "#FFFFFF"}
            onChange={(evt) => onChange(evt.target.value, name)}
          />
        </Box>
      );

    case "number":
      return (
        <FormControl fullWidth required={required}>
          <FormLabel sx={{ display: "flex" }}>
            <Stack direction="row" alignItems="center">
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
              ) : (
                " "
              )}

              {FieldTypeLabel}
            </Stack>
          </FormLabel>
          <TextField
            size="small"
            variant="outlined"
            type="number"
            value={value ? value.toString() : "0"}
            name={name}
            required={required}
            helperText={description}
            onChange={(evt) => onChange(evt.target.value, name)}
          />
        </FormControl>
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
         * this ensures that behavior is maintained.
         */
        onChange(moment(value).format("YYYY-MM-DD HH:mm:ss"), name, datatype);
      }, []);

      return (
        <FieldTypeDate
          name={name}
          label={
            <Stack direction="row" alignItems="center">
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
              ) : (
                ""
              )}

              {FieldTypeLabel}
            </Stack>
          }
          helperText={description}
          required={required}
          value={value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : null}
          inputFormat="yyyy-MM-dd"
          onChange={(date) => onDateChange(date, name, datatype)}
        />
      );

    case "datetime":
      const onDateTimeChange = useCallback((value, name, datatype) => {
        onChange(moment(value).format("YYYY-MM-DD HH:mm:ss"), name, datatype);
      }, []);
      return (
        <FieldTypeDateTime
          name={name}
          label={
            <Stack direction="row" alignItems="center">
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
              ) : (
                ""
              )}

              {FieldTypeLabel}
            </Stack>
          }
          helperText={description}
          required={required}
          value={value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : null}
          inputFormat="yyyy-MM-dd HH:mm:ss.SSSSSS"
          onChange={(date) => onDateTimeChange(date, name, datatype)}
        />
      );

    case "sort":
      return (
        <FieldTypeSort
          sx={{ maxWidth: "200px" }}
          name={name}
          label={
            <Stack direction="row" alignItems="center">
              {settings.tooltip ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={settings.tooltip ? settings.tooltip : " "}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
              ) : (
                " "
              )}

              {FieldTypeLabel}
            </Stack>
          }
          helperText={description}
          required={required}
          value={value?.toString() || ""}
          onChange={(evt) => {
            onChange(parseInt(evt.target.value), name);
          }}
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
