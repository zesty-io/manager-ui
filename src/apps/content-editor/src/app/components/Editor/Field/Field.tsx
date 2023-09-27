import {
  memo,
  useMemo,
  useCallback,
  useState,
  useEffect,
  ChangeEvent,
} from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import zuid from "zuid";

import { fetchFields } from "../../../../../../../shell/store/fields";
import {
  fetchItems,
  searchItems,
} from "../../../../../../../shell/store/content";
import { EditorType, FieldShell } from "./FieldShell";

import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Select,
  MenuItem,
  Chip,
  TextField,
  Dialog,
  IconButton,
} from "@mui/material";

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
import { FieldTypeUUID } from "../../../../../../../shell/components/FieldTypeUUID";
import { FieldTypeCurrency } from "../../../../../../../shell/components/FieldTypeCurrency";
import { FieldTypeInternalLink } from "../../../../../../../shell/components/FieldTypeInternalLink";
import { FieldTypeImage } from "../../../../../../../shell/components/FieldTypeImage";
import { FieldTypeEditor } from "../../../../../../../shell/components/FieldTypeEditor";
import { FieldTypeTinyMCE } from "../../../../../../../shell/components/FieldTypeTinyMCE";
import { FieldTypeColor } from "../../../../../../../shell/components/FieldTypeColor";
import {
  FieldTypeOneToMany,
  OneToManyOptions,
} from "../../../../../../../shell/components/FieldTypeOneToMany";
import {
  FieldTypeOneToOne,
  OneToOneOptions,
} from "../../../../../../../shell/components/FieldTypeOneToOne";
import { FieldTypeDate } from "../../../../../../../shell/components/FieldTypeDate";
import { FieldTypeDateTime } from "../../../../../../../shell/components/FieldTypeDateTime";
import { FieldTypeSort } from "../../../../../../../shell/components/FieldTypeSort";

import styles from "./Field.less";
import { MemoryRouter } from "react-router";
import { withAI } from "../../../../../../../shell/components/withAi";
import { useGetContentModelFieldsQuery } from "../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../shell/store/types";
import {
  ContentItem,
  ContentModelField,
  FieldSettings,
  Language,
} from "../../../../../../../shell/services/types";

const AIFieldShell = withAI(FieldShell);

// NOTE: Componetized so it can be memoized for input/render perf
const ResolvedOption = memo(
  ({
    itemZUID,
    modelZUID,
    html,
  }: {
    itemZUID: string;
    modelZUID: string;
    html: any;
  }) => {
    return (
      <span className={styles.ResolvedOption}>
        <span onClick={(evt) => evt.stopPropagation()}>
          <AppLink
            className={styles.relatedItemLink}
            to={`/content/${modelZUID}/${itemZUID}`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </AppLink>
        </span>
        &nbsp;{html}
      </span>
    );
  }
);

// NOTE: Componetized so it can be memoized for input/render perf
const LinkOption = memo(
  ({ modelZUID, itemZUID }: { modelZUID: string; itemZUID: string }) => {
    return (
      <>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        &nbsp;
        <AppLink to={`/content/${modelZUID}/${itemZUID}`}>{itemZUID}</AppLink>
        <strong>&nbsp;is missing a meta title</strong>
      </>
    );
  }
);

function sortTitle(a: any, b: any) {
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
function sortHTML(a: any, b: any) {
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

const resolveRelatedOptions = (
  fields: Record<string, ContentModelField>,
  items: any,
  fieldZUID: string,
  modelZUID: string,
  langID: number,
  value: any
): OneToManyOptions[] | OneToOneOptions[] => {
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
};

const getSelectedLang = (langs: Language[], langID: number) =>
  langs.find((lang: any) => lang.ID === langID).code;

type FieldProps = {
  ZUID: string;
  contentModelZUID: string;
  item: Partial<ContentItem> & { dirty: boolean };
  datatype: string;
  required: boolean;
  settings: FieldSettings;
  label: string;
  name: string;
  relatedFieldZUID: string;
  relatedModelZUID: string;
  langID: number;
  onChange: (value: any, name: string, datatype?: string) => void;
  onSave: () => void;
  missingRequired: boolean;
};
export const Field = ({
  ZUID,
  contentModelZUID,
  item,
  datatype,
  required,
  settings,
  label,
  name,
  relatedFieldZUID,
  relatedModelZUID,
  langID,
  onChange,
  onSave,
  missingRequired,
}: FieldProps) => {
  const dispatch = useDispatch();
  const allItems = useSelector((state: AppState) => state.content);
  const allFields = useSelector((state: AppState) => state.fields);
  const allLanguages = useSelector((state: AppState) => state.languages);
  const { data: fields } = useGetContentModelFieldsQuery(contentModelZUID);

  const [imageModal, setImageModal] = useState(null);
  const [editorType, setEditorType] = useState<EditorType>();

  const value = item?.data?.[name];
  const version = item?.meta?.version;
  const fieldData = fields?.find((field) => field.ZUID === ZUID);

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
              overflow: "hidden",
            },
          }}
          onClose={() => setImageModal(null)}
        >
          <IconButton
            sx={{
              position: "fixed",
              right: 15,
              top: 10,
            }}
            onClick={() => setImageModal(null)}
          >
            <CloseIcon sx={{ color: "common.white" }} />
          </IconButton>
          <MediaApp
            limitSelected={imageModal?.limit}
            isSelectDialog={true}
            addImagesCallback={(images) => {
              imageModal.callback(images);
              setImageModal(null);
            }}
          />
        </Dialog>
      </MemoryRouter>,
      document.getElementById("modalMount")
    );
  }

  switch (datatype) {
    case "text":
      return (
        <AIFieldShell
          name={fieldData?.name}
          label={fieldData?.label}
          valueLength={(value as string)?.length ?? 0}
          settings={fieldData}
          onChange={(evt: ChangeEvent<HTMLInputElement>) =>
            onChange(evt.target.value, name)
          }
          withLengthCounter
          missingRequired={missingRequired}
          aiType="text"
        >
          <TextField
            value={value}
            onChange={(evt) => onChange(evt.target.value, name)}
            fullWidth
          />
        </AIFieldShell>
      );

    case "fontawesome":
      return (
        <FieldShell
          settings={fieldData}
          valueLength={(value as string)?.length ?? 0}
          missingRequired={missingRequired}
        >
          <TextField
            value={value}
            onChange={(evt) => onChange(evt.target.value, name)}
            fullWidth
          />
        </FieldShell>
      );

    case "link":
      return (
        <FieldShell
          settings={fieldData}
          valueLength={(value as string)?.length ?? 0}
          missingRequired={missingRequired}
          maxLength={2000}
          withLengthCounter
        >
          <TextField
            value={value}
            onChange={(evt) => onChange(evt.target.value, name)}
            fullWidth
            type="url"
          />
        </FieldShell>
      );

    case "uuid":
      //Note we should generate the UUID here if one does not exist
      return (
        <FieldShell
          settings={fieldData}
          valueLength={(value as string)?.length ?? 0}
          missingRequired={missingRequired}
        >
          <FieldTypeUUID
            // @ts-ignore component not typed
            name={name}
            placeholder="UUID field values are auto-generated"
            value={value}
            onChange={onChange} // Is used to set the UUID value on new item creation
          />
        </FieldShell>
      );

    case "textarea":
      return (
        <AIFieldShell
          name={fieldData?.name}
          label={fieldData?.label}
          valueLength={(value as string)?.length ?? 0}
          settings={fieldData}
          onChange={(evt: ChangeEvent<HTMLInputElement>) =>
            onChange(evt.target.value, name)
          }
          withLengthCounter
          missingRequired={missingRequired}
          aiType="paragraph"
          maxLength={16000}
        >
          <TextField
            value={value}
            onChange={(evt) => onChange(evt.target.value, name)}
            fullWidth
            multiline
            rows={6}
          />
        </AIFieldShell>
      );

    case "wysiwyg_advanced":
    case "wysiwyg_basic":
      return (
        <div className={styles.WYSIWYGFieldType}>
          <AIFieldShell
            name={fieldData?.name}
            label={fieldData?.label}
            valueLength={(value as string)?.length ?? 0}
            settings={fieldData}
            onChange={onChange}
            missingRequired={missingRequired}
            aiType="paragraph"
            datatype={fieldData?.datatype}
          >
            <FieldTypeTinyMCE
              // @ts-ignore component not typed
              name={name}
              value={value}
              version={version}
              onChange={onChange}
              onSave={onSave}
              datatype={datatype}
              skin="oxide"
              skinURL="/vendors/tinymce/skins/ui/oxide"
              contentCSS="/vendors/tinymce/content.css"
              externalPlugins={{
                advcode: "/vendors/tinymce/plugins/advcode/plugin.js",
                powerpaste: "/vendors/tinymce/plugins/powerpaste/plugin.js",
                formatpainter:
                  "/vendors/tinymce/plugins/formatpainter/plugin.js",
                pageembed: "/vendors/tinymce/plugins/pageembed/plugin.js",
              }}
              mediaBrowser={(opts: any) => {
                setImageModal(opts);
              }}
            />
          </AIFieldShell>
          {imageModal && renderMediaModal()}
        </div>
      );

    case "markdown":
    case "article_writer":
      return (
        <div className={styles.WYSIWYGFieldType}>
          <AIFieldShell
            name={fieldData?.name}
            label={fieldData?.label}
            valueLength={(value as string)?.length ?? 0}
            settings={fieldData}
            onChange={onChange}
            missingRequired={missingRequired}
            aiType="paragraph"
            datatype={fieldData?.datatype}
            editorType={editorType}
            onEditorChange={(value: EditorType) => setEditorType(value)}
          >
            <FieldTypeEditor
              // @ts-ignore component not typed
              name={name}
              value={value}
              version={version}
              onChange={onChange}
              datatype={datatype}
              mediaBrowser={(opts: any) => {
                setImageModal(opts);
              }}
              editor={editorType}
            />
          </AIFieldShell>
          {imageModal && renderMediaModal()}
        </div>
      );

    case "files":
    case "images":
      const images = useMemo(
        () => ((value as string) || "").split(",").filter((el: string) => el),
        [value]
      );

      return (
        <>
          <FieldShell settings={fieldData} missingRequired={missingRequired}>
            <FieldTypeImage
              images={images}
              name={name}
              limit={(settings && settings.limit) || 1}
              locked={Boolean(
                settings && settings.group_id && settings.group_id != "0"
              )}
              onChange={onChange}
              value={value}
              resolveImage={(zuid: string, width: string, height: string) =>
                // @ts-ignore
                `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${width}&h=${height}&type=fit`
              }
              mediaBrowser={(opts: any) => {
                setImageModal(opts);
              }}
            />
          </FieldShell>
          {imageModal && (
            <MemoryRouter>
              <Dialog
                open
                fullScreen
                sx={{ my: 2.5, mx: 10 }}
                PaperProps={{
                  style: {
                    borderRadius: "4px",
                    overflow: "hidden",
                  },
                }}
                onClose={() => setImageModal(null)}
              >
                <IconButton
                  sx={{
                    position: "fixed",
                    right: 5,
                    top: 0,
                  }}
                  onClick={() => setImageModal(null)}
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
                    setImageModal(null);
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
          <FieldShell settings={fieldData} missingRequired={missingRequired}>
            <ToggleButtonGroup
              color="secondary"
              size="small"
              value={value}
              exclusive
              onChange={(_, val) => onChange(val, name)}
            >
              <ToggleButton value={0}>
                {binaryFieldOpts[0] || "No"}{" "}
              </ToggleButton>
              <ToggleButton value={1}>
                {binaryFieldOpts[1] || "Yes"}{" "}
              </ToggleButton>
            </ToggleButtonGroup>
          </FieldShell>
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
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <Select
            name={name}
            variant="outlined"
            displayEmpty
            value={value || ""}
            onChange={(e) => onChange(e.target.value, name)}
          >
            <MenuItem value="">Select</MenuItem>
            {dropdownOptions.map((dropdownOption, idx) => (
              <MenuItem key={idx} value={dropdownOption.value}>
                {dropdownOption.text}
              </MenuItem>
            ))}
          </Select>
        </FieldShell>
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
          value: value as string,
          html: `Selected item not found: ${value}`,
        });
      }

      const onInternalLinkSearch = useCallback(
        (term) => dispatch(searchItems(term)),
        []
      );

      return (
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <FieldTypeInternalLink
            // @ts-ignore component not typed
            name={name}
            value={value}
            onChange={onChange}
            onSearch={onInternalLinkSearch}
            options={internalLinkOptions}
          />
        </FieldShell>
      );

    case "one_to_one":
      const onOneToOneOpen = useCallback(() => {
        return dispatch(
          fetchItems(relatedModelZUID, {
            lang: getSelectedLang(allLanguages, langID),
          })
        );
      }, [allLanguages.length, relatedModelZUID, langID]);

      let oneToOneOptions: OneToManyOptions[] = useMemo(() => {
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
          value: value as string,
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
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <FieldTypeOneToOne
            name={name}
            value={
              oneToOneOptions?.find((options) => options.value === value) ||
              null
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
        </FieldShell>
      );

    case "one_to_many":
      const oneToManyOptions: OneToManyOptions[] = useMemo(() => {
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
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <FieldTypeOneToMany
            name={name}
            value={
              (value &&
                (value as string)
                  ?.split(",")
                  ?.map(
                    (value: any) =>
                      oneToManyOptions?.find(
                        (options) => options.value === value
                      ) || { value, inputLabel: value, component: value }
                  )) ||
              []
            }
            onChange={(_, options: OneToManyOptions[]) =>
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
        </FieldShell>
      );

    case "color":
      return (
        <Box width={300}>
          <FieldShell settings={fieldData} missingRequired={missingRequired}>
            <FieldTypeColor
              name={name}
              value={value || "#FFFFFF"}
              onChange={(evt) => onChange(evt.target.value, name)}
            />
          </FieldShell>
        </Box>
      );

    case "number":
      return (
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <TextField
            size="small"
            variant="outlined"
            type="number"
            fullWidth
            value={value ? value.toString() : "0"}
            name={name}
            required={required}
            onChange={(evt) => onChange(evt.target.value, name)}
          />
        </FieldShell>
      );

    case "currency":
      return (
        <FieldShell
          settings={fieldData}
          customTooltip={`View this value in different currencies based upon your locale "${window.navigator.language}"`}
          missingRequired={missingRequired}
        >
          <FieldTypeCurrency
            // @ts-ignore component not typed
            name={name}
            placeholder="0.00"
            value={value}
            onChange={onChange}
          />
        </FieldShell>
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
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <Box width={360}>
            <FieldTypeDate
              name={name}
              required={required}
              value={value ? new Date(value) : null}
              inputFormat="yyyy-MM-dd"
              onChange={(date) => onDateChange(date, name, datatype)}
            />
          </Box>
        </FieldShell>
      );

    case "datetime":
      const onDateTimeChange = useCallback((value, name, datatype) => {
        onChange(moment(value).format("YYYY-MM-DD HH:mm:ss"), name, datatype);
      }, []);
      return (
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <Box width={360}>
            <FieldTypeDateTime
              name={name}
              required={required}
              value={value ? new Date(value) : null}
              inputFormat="yyyy-MM-dd HH:mm:ss.SSSSSS"
              onChange={(date) => onDateTimeChange(date, name, datatype)}
            />
          </Box>
        </FieldShell>
      );

    case "sort":
      return (
        <FieldShell settings={fieldData} missingRequired={missingRequired}>
          <FieldTypeSort
            sx={{ maxWidth: "200px" }}
            name={name}
            required={required}
            value={value?.toString() || ""}
            onChange={(evt) => {
              onChange(parseInt(evt.target.value), name);
            }}
          />
        </FieldShell>
      );

    default:
      return (
        <AppLink to={`/schema/${contentModelZUID}/field/${ZUID}`}>
          Failed loading {label} field. Click here to view field schema.
        </AppLink>
      );
  }
};
