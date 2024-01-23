import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  ChangeEvent,
  useContext,
  memo,
} from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import zuid from "zuid";
import { useParams } from "react-router";

import { fetchFields } from "../../../../../../../shell/store/fields";
import {
  fetchItems,
  searchItems,
} from "../../../../../../../shell/store/content";
import { EditorType, FieldShell, Error } from "./FieldShell";

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
import { FieldTypeEditor } from "../../../../../../../shell/components/FieldTypeEditor";
import { FieldTypeTinyMCE } from "../../../../../../../shell/components/FieldTypeTinyMCE";
import { FieldTypeColor } from "../../../../../../../shell/components/FieldTypeColor";
import {
  FieldTypeOneToMany,
  OneToManyOptions,
} from "../../../../../../../shell/components/FieldTypeOneToMany";
import { FieldTypeOneToOne } from "../../../../../../../shell/components/FieldTypeOneToOne";
import { FieldTypeDate } from "../../../../../../../shell/components/FieldTypeDate";
import { FieldTypeDateTime } from "../../../../../../../shell/components/FieldTypeDateTime";
import { FieldTypeSort } from "../../../../../../../shell/components/FieldTypeSort";

import styles from "./Field.less";
import { MemoryRouter } from "react-router";
import { withAI } from "../../../../../../../shell/components/withAi";
import { useGetContentModelFieldsQuery } from "../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../shell/store/types";
import {
  FieldSettings,
  Language,
} from "../../../../../../../shell/services/types";
import { FieldTypeMedia } from "../../FieldTypeMedia";
import { cloneDeep } from "lodash";
import { ContentFieldErrorsContext } from "../../../../../../../shell/contexts/contentFieldErrorsContext";

const AIFieldShell = withAI(FieldShell);

const getSelectedLang = (langs: Language[], langID: number) =>
  langs.find((lang: any) => lang.ID === langID)?.code;

type FieldProps = {
  ZUID: string;
  contentModelZUID: string;
  datatype: string;
  required: boolean;
  settings: FieldSettings;
  label: string;
  name: string;
  relatedFieldZUID: string;
  relatedModelZUID: string;
  langID: number;
  errors: Error;
  maxLength: number;
  isFirstTextField: boolean;
  isDataSet: boolean;
  isFirstContentField: boolean;
  value: string | number;
  version: number;
};
export const Field = memo(
  ({
    ZUID,
    contentModelZUID,
    datatype,
    required,
    settings,
    label,
    name,
    relatedFieldZUID,
    relatedModelZUID,
    langID,
    errors,
    maxLength,
    isFirstTextField,
    isDataSet,
    isFirstContentField,
    value,
    version,
  }: FieldProps) => {
    const dispatch = useDispatch();
    const { modelZUID, itemZUID } = useParams<{
      modelZUID: string;
      itemZUID: string;
    }>();
    const { updateFieldErrors } = useContext(ContentFieldErrorsContext);
    const allLanguages = useSelector((state: AppState) => state.languages);
    const { data: fields } = useGetContentModelFieldsQuery(contentModelZUID);

    const [imageModal, setImageModal] = useState(null);
    const [editorType, setEditorType] = useState<EditorType>();

    const fieldData = fields?.find((field) => field.ZUID === ZUID);

    useEffect(() => {
      if (datatype !== "date" && datatype !== "datetime") {
        if (value && typeof value === "string") {
          value.split(",").forEach((z) => {
            if (
              zuid.isValid(z) &&
              !zuid.matches(z, zuid.prefix["MEDIA_FILE"])
            ) {
              dispatch(searchItems(z));
            }
          });
        }
      }
    }, []);

    const renderMediaModal = () => {
      return ReactDOM.createPortal(
        <MemoryRouter
          initialEntries={
            imageModal?.filetype
              ? [`/media?filetype=${imageModal.filetype}`]
              : ["/media"]
          }
        >
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
    };

    const handleValueChanged = (value: any, name: string) => {
      if (!name) {
        throw new Error("Input is missing name attribute");
      }

      let currentErrors = cloneDeep(errors) ?? {};
      const _itemZUID = itemZUID ?? `new:${modelZUID}`;

      // Remove the required field error message when a value has been added
      if (required) {
        if (datatype === "yes_no" && value !== null) {
          currentErrors = {
            ...currentErrors,
            MISSING_REQUIRED: false,
          };
        } else if (datatype !== "yes_no" && value) {
          currentErrors = {
            ...currentErrors,
            MISSING_REQUIRED: false,
          };
        }
      }

      // Validate character length
      if (maxLength) {
        if (value.length > maxLength) {
          currentErrors = {
            ...currentErrors,
            EXCEEDING_MAXLENGTH: value.length - maxLength,
          };
        } else {
          currentErrors = { ...currentErrors, EXCEEDING_MAXLENGTH: 0 };
        }
      }

      updateFieldErrors(name, currentErrors);
      // onUpdateFieldErrors(errors);

      // Always dispatch the data update
      dispatch({
        type: "SET_ITEM_DATA",
        itemZUID: _itemZUID,
        key: name,
        // convert empty strings to null
        value: value || null,
      });

      // If we are working with a new item
      if (_itemZUID?.slice(0, 3) === "new") {
        if (isFirstTextField) {
          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID: _itemZUID,
            key: "metaLinkText",
            value: value,
          });
          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID: _itemZUID,
            key: "metaTitle",
            value: value,
          });

          // Datasets do not get path parts
          if (isDataSet) {
            dispatch({
              type: "SET_ITEM_WEB",
              itemZUID: _itemZUID,
              key: "pathPart",
              value: value
                .trim()
                .toLowerCase()
                .replace(
                  /'|-|"|@|%|\(|\)|:|;|\{|\}|\[|\]|\*|\$|!|,|¿|¡|`|™|©|®|€/g,
                  ""
                )
                .replace(/\&/g, "and")
                .replace("æ", "ae")
                .replace("œ", "oe")
                .replace(/å|à|á|â|ä/g, "a")
                .replace(/è|é|ê|ë/g, "e")
                .replace(/ì|í|î|ï/g, "i")
                .replace(/ñ/, "n")
                .replace(/ò|ó|ô|ö/g, "o")
                .replace(/ù|ú|û|ü/g, "u")
                .replace(/\+/g, "plus")
                .replace(/\s+/g, " ") // Important this is before hyphen replacement, this prevent doubling or trippling up hyphens due to mulitple spaces
                .replace(/[^a-zA-Z0-9]/g, "-"),
            });
          }
        }

        if (isFirstContentField) {
          dispatch({
            type: "SET_ITEM_WEB",
            itemZUID: _itemZUID,
            key: "metaDescription",
            value: value.replace(/<[^>]*>/g, "").slice(0, 160),
          });
        }
      }
    };

    switch (datatype) {
      case "text":
        return (
          <AIFieldShell
            name={fieldData?.name}
            label={fieldData?.label}
            valueLength={(value as string)?.length ?? 0}
            settings={fieldData}
            onChange={(evt: ChangeEvent<HTMLInputElement>) =>
              handleValueChanged(evt.target.value, name)
            }
            withLengthCounter
            maxLength={maxLength}
            errors={errors}
            aiType="text"
          >
            <TextField
              value={value}
              onChange={(evt) => handleValueChanged(evt.target.value, name)}
              fullWidth
              inputProps={{
                name: fieldData?.name,
              }}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </AIFieldShell>
        );

      case "fontawesome":
        return (
          <FieldShell
            settings={fieldData}
            valueLength={(value as string)?.length ?? 0}
            errors={errors}
          >
            <TextField
              value={value}
              onChange={(evt) => handleValueChanged(evt.target.value, name)}
              fullWidth
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "link":
        return (
          <FieldShell
            settings={fieldData}
            valueLength={(value as string)?.length ?? 0}
            errors={errors}
            maxLength={maxLength}
            withLengthCounter
          >
            <TextField
              value={value}
              onChange={(evt) => handleValueChanged(evt.target.value, name)}
              fullWidth
              type="url"
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "uuid":
        //Note we should generate the UUID here if one does not exist
        return (
          <FieldShell
            settings={fieldData}
            valueLength={(value as string)?.length ?? 0}
            errors={errors}
          >
            <FieldTypeUUID
              // @ts-ignore component not typed
              name={name}
              placeholder="UUID field values are auto-generated"
              value={value}
              onChange={handleValueChanged} // Is used to set the UUID value on new item creation
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
              handleValueChanged(evt.target.value, name)
            }
            withLengthCounter
            errors={errors}
            aiType="paragraph"
            maxLength={maxLength}
          >
            <TextField
              value={value}
              onChange={(evt) => handleValueChanged(evt.target.value, name)}
              fullWidth
              multiline
              rows={6}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </AIFieldShell>
        );

      case "wysiwyg_advanced":
      case "wysiwyg_basic":
        const [characterCount, setCharacterCount] = useState(0);

        return (
          <div className={styles.WYSIWYGFieldType}>
            <AIFieldShell
              name={fieldData?.name}
              label={fieldData?.label}
              valueLength={characterCount}
              settings={fieldData}
              onChange={handleValueChanged}
              errors={errors}
              aiType="paragraph"
              datatype={fieldData?.datatype}
              withLengthCounter
              maxLength={maxLength}
            >
              <FieldTypeTinyMCE
                name={name}
                value={value}
                version={version}
                onChange={handleValueChanged}
                // onSave={onSave}
                onCharacterCountChange={(charCount: number) =>
                  setCharacterCount(charCount)
                }
                datatype={datatype}
                mediaBrowser={(opts: any) => {
                  setImageModal(opts);
                }}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
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
              onChange={handleValueChanged}
              errors={errors}
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
                onChange={handleValueChanged}
                datatype={datatype}
                mediaBrowser={(opts: any) => {
                  setImageModal(opts);
                }}
                editor={editorType}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
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
        const error = errors && Object.values(errors)?.some((error) => !!error);

        return (
          <>
            <FieldShell settings={fieldData} errors={errors}>
              <FieldTypeMedia
                hasError={error}
                limit={(settings && settings.limit) || 1}
                imageZUIDs={images}
                openMediaBrowser={(opts: any) => {
                  setImageModal({
                    ...opts,
                    locked: Boolean(
                      settings && settings.group_id && settings.group_id != "0"
                    ),
                  });
                }}
                name={name}
                onChange={handleValueChanged}
                lockedToGroupId={
                  settings?.group_id && settings?.group_id !== "0"
                    ? settings.group_id
                    : null
                }
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
                    limitSelected={
                      imageModal.isReplace
                        ? 1
                        : imageModal.limit - images.length
                    }
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
                    isReplace={imageModal.isReplace}
                  />
                </Dialog>
              </MemoryRouter>
            )}
          </>
        );

      case "yes_no":
        if (settings.options) {
          const binaryFieldOpts = Object.values(settings.options);
          const error =
            errors && Object.values(errors)?.some((error) => !!error);

          return (
            <FieldShell settings={fieldData} errors={errors}>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={value}
                exclusive
                onChange={(_, val) => handleValueChanged(val, name)}
              >
                <ToggleButton
                  value={0}
                  sx={{
                    borderColor: error ? "error.main" : "rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {binaryFieldOpts[0] || "No"}{" "}
                </ToggleButton>
                <ToggleButton
                  value={1}
                  sx={{
                    borderColor: error ? "error.main" : "rgba(0, 0, 0, 0.12)",
                  }}
                >
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
          <FieldShell settings={fieldData} errors={errors}>
            <Select
              name={name}
              variant="outlined"
              displayEmpty
              value={value || ""}
              onChange={(e) => handleValueChanged(e.target.value, name)}
              error={errors && Object.values(errors)?.some((error) => !!error)}
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
        const onInternalLinkSearch = useCallback(
          (term) => dispatch(searchItems(term)),
          []
        );

        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeInternalLink
              // @ts-ignore component not typed
              name={name}
              value={value}
              onChange={(value: string) => handleValueChanged(value, name)}
              onSearch={onInternalLinkSearch}
              error={errors && Object.values(errors)?.some((error) => !!error)}
              langID={langID}
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

        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeOneToOne
              name={name}
              value={value}
              onChange={(_, option) => handleValueChanged(option.value, name)}
              onOpen={onOneToOneOpen}
              startAdornment={
                value && (
                  <AppLink to={`/content/${relatedModelZUID}/${value}`}>
                    <FontAwesomeIcon icon={faEdit} />
                  </AppLink>
                )
              }
              endAdornment={
                value && <em>{getSelectedLang(allLanguages, langID)}</em>
              }
              error={errors && Object.values(errors)?.some((error) => !!error)}
              langID={langID}
              relatedFieldZUID={relatedFieldZUID}
              relatedModelZUID={relatedModelZUID}
            />
          </FieldShell>
        );

      case "one_to_many":
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
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeOneToMany
              name={name}
              value={value}
              onChange={(_, options: OneToManyOptions[]) => {
                const selectedOptions = options?.length
                  ? options.map((option) => option.value).join(",")
                  : null;
                handleValueChanged(selectedOptions, name);
              }}
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
              error={errors && Object.values(errors)?.some((error) => !!error)}
              langID={langID}
              relatedFieldZUID={relatedFieldZUID}
              relatedModelZUID={relatedModelZUID}
            />
          </FieldShell>
        );

      case "color":
        return (
          <Box maxWidth={300}>
            <FieldShell settings={fieldData} errors={errors}>
              <FieldTypeColor
                name={name}
                value={value || "#FFFFFF"}
                onChange={(evt) => handleValueChanged(evt.target.value, name)}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
              />
            </FieldShell>
          </Box>
        );

      case "number":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <TextField
              size="small"
              variant="outlined"
              type="number"
              fullWidth
              value={value ? value.toString() : "0"}
              name={name}
              required={required}
              onChange={(evt) => handleValueChanged(evt.target.value, name)}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "currency":
        return (
          <FieldShell
            settings={fieldData}
            customTooltip={`View this value in different currencies based upon your locale "${window.navigator.language}"`}
            errors={errors}
          >
            <FieldTypeCurrency
              // @ts-ignore component not typed
              name={name}
              placeholder="0.00"
              value={value}
              onChange={handleValueChanged}
              error={errors && Object.values(errors)?.some((error) => !!error)}
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
        const onDateChange = useCallback(
          (value, name) => {
            /**
             * Flatpickr emits a utc timestamp, offset from users local time.
             * Legacy behavior did not send utc but sent the value as is selected by the user
             * this ensures that behavior is maintained.
             */
            handleValueChanged(
              moment(value).format("YYYY-MM-DD HH:mm:ss"),
              name
            );
          },
          [handleValueChanged]
        );

        return (
          <FieldShell settings={fieldData} errors={errors}>
            <Box maxWidth={360}>
              <FieldTypeDate
                name={name}
                required={required}
                // use moment to create a UTC date object
                value={
                  value
                    ? new Date(moment(value).format("YYYY-MM-DD HH:mm:ss"))
                    : null
                }
                inputFormat="yyyy-MM-dd"
                onChange={(date) => onDateChange(date, name)}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
              />
            </Box>
          </FieldShell>
        );

      case "datetime":
        const onDateTimeChange = useCallback(
          (value, name, datatype) => {
            handleValueChanged(
              moment(value).format("YYYY-MM-DD HH:mm:ss"),
              name
            );
          },
          [handleValueChanged]
        );
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <Box maxWidth={360}>
              <FieldTypeDateTime
                name={name}
                required={required}
                value={value ? new Date(value) : null}
                inputFormat="yyyy-MM-dd HH:mm:ss.SSSSSS"
                onChange={(date) => onDateTimeChange(date, name, datatype)}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
              />
            </Box>
          </FieldShell>
        );

      case "sort":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeSort
              sx={{ maxWidth: "200px" }}
              name={name}
              required={required}
              value={value?.toString() || ""}
              onChange={(evt) => {
                handleValueChanged(parseInt(evt.target.value), name);
              }}
              error={errors && Object.values(errors)?.some((error) => !!error)}
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
  }
);
