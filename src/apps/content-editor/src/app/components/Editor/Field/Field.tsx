import {
  useMemo,
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  memo,
} from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";

import { EditorType, FieldShell, Error } from "./FieldShell";

import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  TextField,
  Dialog,
  IconButton,
  Autocomplete,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
// it would be nice to have a central import for all of these
// instead of individually importing
import { AppLink } from "shell/components/AppLink";
import { MediaApp } from "../../../../../../media/src/app";
import { FieldTypeUUID } from "../../../../../../../shell/components/FieldTypeUUID";
import { FieldTypeCurrency } from "../../../../../../../shell/components/FieldTypeCurrency";
import { FieldTypeEditor } from "../../../../../../../shell/components/FieldTypeEditor";
import { FieldTypeTinyMCE } from "../../../../../../../shell/components/FieldTypeTinyMCE";
import { FieldTypeColor } from "../../../../../../../shell/components/FieldTypeColor";
import { RelationalFieldBase } from "../../../../../../../shell/components/RelationalFieldBase";
import { FieldTypeDate } from "../../../../../../../shell/components/FieldTypeDate";
import { FieldTypeDateTime } from "../../../../../../../shell/components/FieldTypeDateTime";
import { FieldTypeSort } from "../../../../../../../shell/components/FieldTypeSort";
import { FieldTypeNumber } from "../../../../../../../shell/components/FieldTypeNumber";
import { FieldTypeBlockSelector } from "../../../../../../../shell/components/FieldTypeBlockSelector";
import { InternalLink } from "./InternalLink";
import styles from "./Field.less";
import { MemoryRouter } from "react-router";
import { withAI } from "../../../../../../../shell/components/withAi";
import { useGetContentModelFieldsQuery } from "../../../../../../../shell/services/instance";
import {
  ContentItem,
  FieldSettings,
} from "../../../../../../../shell/services/types";
import { FieldTypeMedia } from "../../FieldTypeMedia";
import { debounce, parseInt } from "lodash";
import { useRegisterRef } from "../../../../../../../engine/useRegisterRef";
import { IntegrationFieldSelect } from "shell/components/FieldTypeIntegration";
import { useDebouncedInput } from "../../../../../../../shell/hooks/useDebouncedInput";
import { format as fmt } from "date-fns";
import { FieldTypeRepeater } from "shell/components/FieldTypeRepeater";

const AIFieldShell = withAI(FieldShell);

export const sortHTML = (a: any, b: any) => {
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
};

type FieldProps = {
  ZUID: string;
  contentModelZUID: string;
  datatype: string;
  required: boolean;
  settings: FieldSettings;
  label: string;
  name: string;
  version: any;
  value: any;
  relatedFieldZUID: string;
  relatedModelZUID: string;
  langID: number;
  onChange: (value: any, name: string, datatype?: string) => void;
  onSave: () => void;
  errors: Error;
  maxLength: number;
  minLength: number;
  compact?: boolean;
};

export const Field = memo(
  ({
    ZUID,
    contentModelZUID,
    value,
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
    errors,
    maxLength,
    minLength,
    version,
    compact = false,
  }: FieldProps) => {
    const dispatch = useDispatch();
    const { data: fields } = useGetContentModelFieldsQuery({
      modelZUID: contentModelZUID,
    });

    const [imageModal, setImageModal] = useState(null);
    const [editorType, setEditorType] = useState<EditorType>();

    const fieldData = fields?.find((field) => field.ZUID === ZUID);
    const [rerenderKey, setRerenderKey] = useState(0);

    const { local, onLocalChange } = useDebouncedInput(value, (v) => {
      onChange(v, name);
    });

    const handle = useMemo<any>(
      () => ({
        setValue: (val: string) => {
          const el = document.getElementById(ZUID);
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          }

          const inputEl = el.querySelector(
            'input, textarea, [contenteditable="true"]'
          ) as HTMLElement | null;
          if (inputEl && typeof inputEl.focus === "function") {
            inputEl.focus();
          }

          if (datatype === "number" || datatype === "yes_no") {
            onChange(Number(val), name);
          } else {
            onLocalChange(val);
          }

          setRerenderKey((prevKey: number) => prevKey + 1);
        },
      }),
      []
    );

    useRegisterRef(
      name,
      handle,
      {
        ZUID,
        contentModelZUID,
        currentValue: value,
        datatype,
        required,
        settings,
        label,
        name,
        maxLength,
        minLength,
      },
      {
        skip: [
          "uuid",
          "files",
          "internal_link",
          "one_to_one",
          "one_to_many",
          "block_selector",
          "yes_no",
          "dropdown",
          "date",
          "datetime",
          "integration",
        ].includes(datatype),
      }
    );

    const closeImageModal = () => {
      imageModal?.onClose?.();
      setImageModal(null);
    };

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
            onClose={closeImageModal}
          >
            <IconButton
              sx={{
                position: "fixed",
                right: 15,
                top: 10,
              }}
              onClick={closeImageModal}
            >
              <CloseIcon sx={{ color: "common.white" }} />
            </IconButton>
            <MediaApp
              limitSelected={imageModal?.limit}
              isSelectDialog={true}
              addImagesCallback={(images) => {
                imageModal.callback(images);
                closeImageModal();
              }}
            />
          </Dialog>
        </MemoryRouter>,
        document.getElementById("modalMount")
      );
    };

    const hasErrors = (errors: Error) => {
      return Object.values(errors)?.some((error) => !!error);
    };

    /**
     * @description This function remove items that are only saved in memory.
     * This means that we only shows in the options all items that are saved, published or scheduled.
     *
     */
    const filterValidItems = (items: any) => {
      // remove items that are only saved in memory
      const filteredValidItems = Object.entries<any>(items).filter(
        ([, value]) => value.web.version
      );
      // Reshape the array back into an object
      let options = Object.fromEntries(filteredValidItems);

      return options;
    };

    switch (datatype) {
      case "text":
        return (
          <AIFieldShell
            ZUID={fieldData?.ZUID}
            name={fieldData?.name || name}
            label={fieldData?.label || label}
            valueLength={(local as string)?.length ?? 0}
            settings={
              fieldData || {
                name: name,
                label: label,
                required: required,
              }
            }
            onChange={(evt: ChangeEvent<HTMLInputElement>) =>
              onChange(evt.target.value, name)
            }
            withLengthCounter
            maxLength={maxLength}
            minLength={minLength}
            errors={errors}
            aiType="text"
            value={local}
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
              fullWidth
              inputProps={{
                name: fieldData?.name || name,
                "data-cy": `EditorField-${fieldData?.name || name}`,
              }}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </AIFieldShell>
        );

      case "fontawesome":
        return (
          <FieldShell
            settings={fieldData}
            valueLength={(local as string)?.length ?? 0}
            errors={errors}
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
              fullWidth
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "link":
        return (
          <FieldShell
            settings={fieldData}
            valueLength={(local as string)?.length ?? 0}
            errors={errors}
            maxLength={maxLength}
            withLengthCounter
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
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
              onChange={onChange} // Is used to set the UUID value on new item creation
            />
          </FieldShell>
        );

      case "textarea":
        return (
          <AIFieldShell
            ZUID={fieldData?.ZUID}
            name={fieldData?.name}
            label={fieldData?.label}
            valueLength={(local as string)?.length ?? 0}
            settings={fieldData}
            onChange={(evt: ChangeEvent<HTMLInputElement>) =>
              onChange(evt.target.value, name)
            }
            withLengthCounter
            errors={errors}
            aiType="word"
            maxLength={maxLength}
            minLength={minLength}
            value={local}
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
              fullWidth
              multiline
              rows={compact ? 5 : 6}
              inputProps={{
                "data-cy": `EditorField-${fieldData?.name || name}`,
              }}
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
              ZUID={fieldData?.ZUID}
              name={fieldData?.name}
              label={fieldData?.label}
              valueLength={characterCount}
              settings={fieldData}
              onChange={onChange}
              errors={errors}
              aiType="word"
              datatype={fieldData?.datatype}
              withLengthCounter
              maxLength={maxLength}
              value={local}
            >
              <FieldTypeTinyMCE
                key={rerenderKey}
                name={name}
                value={local}
                version={version}
                onChange={(value) => onLocalChange(value)}
                onSave={onSave}
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
                compact={compact}
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
              key={rerenderKey}
              ZUID={fieldData?.ZUID}
              name={fieldData?.name}
              label={fieldData?.label}
              valueLength={(local as string)?.length ?? 0}
              settings={fieldData}
              onChange={onChange}
              errors={errors}
              aiType="word"
              datatype={fieldData?.datatype}
              editorType={editorType}
              onEditorChange={(value: EditorType) => setEditorType(value)}
              value={local}
            >
              <FieldTypeEditor
                // @ts-ignore component not typed
                name={name}
                value={local}
                version={version}
                onChange={(value: string) => onLocalChange(value)}
                datatype={datatype}
                mediaBrowser={(opts: any) => {
                  setImageModal(opts);
                }}
                editor={editorType}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
                compact={compact}
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
                images={images}
                openMediaBrowser={(opts: any) => {
                  setImageModal({
                    ...opts,
                    locked: Boolean(
                      settings && settings.group_id && settings.group_id != "0"
                    ),
                  });
                }}
                settings={settings}
                name={name}
                onChange={onChange}
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
                  onClose={closeImageModal}
                >
                  <IconButton
                    data-cy="closeMediaDialogBtn"
                    sx={{
                      position: "fixed",
                      right: 5,
                      top: 0,
                    }}
                    onClick={closeImageModal}
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
                      closeImageModal();
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
                onChange={(_, val) => {
                  if (val !== null) {
                    onChange(val, name);
                  }
                }}
              >
                <ToggleButton
                  data-cy="yes_no:no"
                  value={0}
                  sx={{
                    borderColor: error ? "error.main" : "rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {binaryFieldOpts[0] || "No"}{" "}
                </ToggleButton>
                <ToggleButton
                  data-cy="yes_no:yes"
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
            <Autocomplete
              clearOnBlur
              disablePortal
              options={dropdownOptions}
              value={
                dropdownOptions.find((option) => option.value === value) || null
              }
              onChange={(e, newValue) => onChange(newValue?.value || "", name)}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              getOptionLabel={(option) => option.text || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name={name}
                  placeholder="Select"
                  variant="outlined"
                  error={
                    errors && Object.values(errors)?.some((error) => !!error)
                  }
                />
              )}
            />
          </FieldShell>
        );

      case "internal_link":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <InternalLink
              name={name}
              value={value as string}
              onChange={onChange}
              error={errors && Object.values(errors)?.some((error) => !!error)}
              langID={langID}
            />
          </FieldShell>
        );

      case "one_to_one":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <RelationalFieldBase
              name={name}
              value={!!value ? String(value) : null}
              fieldZUID={ZUID}
              relatedModelZUID={relatedModelZUID}
              relatedFieldZUID={relatedFieldZUID}
              onChange={onChange}
              fieldLabel={fieldData?.label}
            />
          </FieldShell>
        );

      case "one_to_many":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <RelationalFieldBase
              name={name}
              multiselect
              value={!!value ? String(value) : null}
              fieldZUID={ZUID}
              relatedModelZUID={relatedModelZUID}
              relatedFieldZUID={relatedFieldZUID}
              onChange={onChange}
              fieldLabel={fieldData?.label}
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
                onChange={(evt) => onChange(evt.target.value, name)}
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
            <FieldTypeNumber
              value={+value || 0}
              name={name}
              required={required}
              onChange={onChange}
              hasError={
                errors && Object.values(errors)?.some((error) => !!error)
              }
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
              name={name}
              currency={settings?.currency ?? "USD"}
              value={String(value)}
              onChange={onChange}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "date":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeDate
              name={name}
              required={required}
              // By appending "T00:00:00", we force JS to parse it as local midnight,
              value={value ? new Date(value + "T00:00:00") : null}
              // format="MMM dd, yyyy"
              onChange={(date) => {
                onChange(date ? fmt(date, "yyyy-MM-dd") : null, name, datatype);
              }}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "datetime":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <Box {...(!compact && { maxWidth: 360 })}>
              <FieldTypeDateTime
                name={name}
                required={required}
                value={(value as string) ?? null}
                onChange={(datetime) => {
                  onChange(datetime, name, datatype);
                }}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
                compact={compact}
              />
            </Box>
          </FieldShell>
        );

      case "sort":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeSort
              name={name}
              required={required}
              value={value?.toString() || "0"}
              onChange={(evt) => {
                onChange(parseInt(evt.target.value) || 0, name);
              }}
              error={errors && Object.values(errors)?.some((error) => !!error)}
            />
          </FieldShell>
        );

      case "block_selector":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeBlockSelector
              value={value ? value?.toString() : null}
              onChange={(value) => onChange(value, name, datatype)}
              requiredError={errors?.MISSING_REQUIRED}
              missingVariantError={errors?.INVALID_BLOCK_VARIANT}
            />
          </FieldShell>
        );
      case "integration":
        return (
          <FieldShell settings={fieldData} errors={errors}>
            <IntegrationFieldSelect
              name={name}
              label={label}
              maxItems={settings?.maxValue}
              config={settings?.integrationFieldConfig}
              value={value ? (value as Record<string, any>[]) : null}
              onChange={(value) => onChange(value, name)}
            />
          </FieldShell>
        );

      case "repeater":
        const hasBaseColumns = (fieldData?.settings?.subFields || []).filter(
          (f) => f.settings?.list
        ).length;

        if (!hasBaseColumns) {
          return <></>;
        }

        return (
          <FieldShell settings={fieldData} errors={errors}>
            <FieldTypeRepeater
              field={fieldData}
              value={value}
              onChange={(value) => onChange(value, name, datatype)}
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

Field.displayName = "Field";
