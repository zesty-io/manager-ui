import { memo, useMemo, useState } from "react";
import { MemoryRouter, useParams } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Dialog,
  IconButton,
  Link,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { createPortal } from "react-dom";
import CloseIcon from "@mui/icons-material/Close";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { RepeaterSubField } from "shell/services/types";
import {
  EditorType,
  Error,
  FieldShell,
} from "../../../../src/apps/content-editor/src/app/components/Editor/Field/FieldShell";
import { MaxLengths } from "../../../apps/content-editor/src/app/components/Editor/Editor";
import { useDebouncedInput } from "shell/hooks/useDebouncedInput";
import { FieldTypeUUID } from "../FieldTypeUUID";
import { FieldTypeTinyMCE } from "../FieldTypeTinyMCE";
import { MediaApp } from "../../../apps/media/src/app";
import { FieldTypeEditor } from "../FieldTypeEditor";
import { FieldTypeMedia } from "../../../apps/content-editor/src/app/components/FieldTypeMedia";
import { FieldTypeColor } from "../FieldTypeColor";
import { FieldTypeNumber } from "../FieldTypeNumber";
import { FieldTypeCurrency } from "../FieldTypeCurrency";
import { FieldTypeSort } from "../FieldTypeSort";
import { FieldTypeDate } from "../FieldTypeDate";
import { FieldTypeDateTime } from "../FieldTypeDateTime";
import { format, isValid } from "date-fns";

type SubFieldProps = {
  value: any;
  onChange: (value: any, name: string) => void;
  field: RepeaterSubField;
  repeaterFieldItemZUID: string;
  errors: Error;
  version?: number;
};

export const SubField = memo(
  ({
    value,
    onChange,
    field,
    repeaterFieldItemZUID,
    errors,
    version,
  }: SubFieldProps) => {
    const { modelZUID } = useParams<{ modelZUID: string }>();
    const { local, onLocalChange } = useDebouncedInput(value, (v) => {
      onChange(v, field.name);
    });
    const [imageModal, setImageModal] = useState(null);

    const renderMediaModal = () => {
      return createPortal(
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

    const maxLength =
      // @ts-expect-error untyped
      field.settings?.maxCharLimit || MaxLengths[field.datatype];
    const minLength = field.settings?.minCharLimit || 0;
    const hasError = errors && Object.values(errors)?.some((error) => !!error);
    let content: JSX.Element;

    switch (field.datatype) {
      case "text":
        content = (
          <FieldShell
            valueLength={(local as string)?.length ?? 0}
            settings={
              field || {
                name: field.name,
                label: field.label,
                required: field.required,
              }
            }
            withLengthCounter
            maxLength={maxLength}
            minLength={minLength}
            errors={errors}
            withComment={false}
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
              fullWidth
              slotProps={{
                htmlInput: {
                  name: field?.name,
                },
              }}
              error={hasError}
            />
          </FieldShell>
        );
        break;

      case "link":
        content = (
          <FieldShell
            settings={field}
            valueLength={(local as string)?.length ?? 0}
            errors={errors}
            maxLength={maxLength}
            withLengthCounter
            withComment={false}
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
              fullWidth
              type="url"
              error={hasError}
            />
          </FieldShell>
        );
        break;

      case "uuid":
        //Note we should generate the UUID here if one does not exist
        content = (
          <FieldShell
            settings={field}
            valueLength={(value as string)?.length ?? 0}
            errors={errors}
            withComment={false}
          >
            <FieldTypeUUID
              // @ts-ignore component not typed
              name={field.name}
              placeholder="UUID field values are auto-generated"
              value={value}
              onChange={onChange} // Is used to set the UUID value on new item creation
            />
          </FieldShell>
        );
        break;

      case "textarea":
        content = (
          <FieldShell
            valueLength={(local as string)?.length ?? 0}
            settings={field}
            withLengthCounter
            errors={errors}
            maxLength={maxLength}
            minLength={minLength}
            withComment={false}
          >
            <TextField
              value={local}
              onChange={(e) => onLocalChange(e.target.value)}
              fullWidth
              multiline
              rows={6}
              error={hasError}
            />
          </FieldShell>
        );
        break;

      case "wysiwyg_basic":
        const [characterCount, setCharacterCount] = useState(0);

        content = (
          <>
            <FieldShell
              valueLength={characterCount}
              settings={field}
              errors={errors}
              withLengthCounter
              maxLength={maxLength}
              withComment={false}
            >
              <FieldTypeTinyMCE
                name={field?.name}
                value={value}
                version={version}
                onChange={(value) => onLocalChange(value)}
                onCharacterCountChange={(charCount: number) =>
                  setCharacterCount(charCount)
                }
                datatype={field?.datatype}
                mediaBrowser={(opts: any) => {
                  setImageModal(opts);
                }}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
              />
            </FieldShell>
            {imageModal && renderMediaModal()}
          </>
        );
        break;

      case "markdown":
        const [editorType, setEditorType] = useState<EditorType>();

        content = (
          <>
            <FieldShell
              valueLength={(local as string)?.length ?? 0}
              settings={field}
              errors={errors}
              editorType={editorType}
              onEditorChange={(value: EditorType) => setEditorType(value)}
              withComment={false}
            >
              <FieldTypeEditor
                // @ts-ignore component not typed
                name={field?.name}
                value={local}
                // version={version}
                onChange={(value: string) => onLocalChange(value)}
                datatype={field?.datatype}
                mediaBrowser={(opts: any) => {
                  setImageModal(opts);
                }}
                editor={editorType}
                error={
                  errors && Object.values(errors)?.some((error) => !!error)
                }
              />
            </FieldShell>
            {imageModal && renderMediaModal()}
          </>
        );
        break;

      case "images":
        const images = useMemo(
          () => ((value as string) || "").split(",").filter((el: string) => el),
          [value]
        );
        const error = errors && Object.values(errors)?.some((error) => !!error);

        content = (
          <>
            <FieldShell settings={field} errors={errors} withComment={false}>
              <FieldTypeMedia
                hasError={error}
                limit={(field?.settings && field?.settings.limit) || 1}
                images={images}
                openMediaBrowser={(opts: any) => {
                  setImageModal({
                    ...opts,
                    locked: Boolean(
                      field?.settings &&
                        field?.settings.group_id &&
                        field?.settings.group_id != "0"
                    ),
                  });
                }}
                settings={field?.settings}
                name={field?.name}
                onChange={onChange}
                lockedToGroupId={
                  field?.settings?.group_id && field?.settings?.group_id !== "0"
                    ? field?.settings?.group_id
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
                    data-cy="closeMediaDialogBtn"
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
                      field?.settings?.group_id &&
                      field?.settings?.group_id !== "0"
                        ? field?.settings?.group_id
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
        break;

      case "yes_no":
        if (field?.settings?.options) {
          const binaryFieldOpts = Object.values(field?.settings?.options);

          content = (
            <FieldShell settings={field} errors={errors} withComment={false}>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={value}
                exclusive
                onChange={(_, val) => {
                  if (val !== null) {
                    onChange(val, field?.name);
                  }
                }}
              >
                <ToggleButton
                  data-cy="yes_no:no"
                  value={0}
                  sx={{
                    borderColor: hasError
                      ? "error.main"
                      : "rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {binaryFieldOpts[0] || "No"}{" "}
                </ToggleButton>
                <ToggleButton
                  data-cy="yes_no:yes"
                  value={1}
                  sx={{
                    borderColor: hasError
                      ? "error.main"
                      : "rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {binaryFieldOpts[1] || "Yes"}{" "}
                </ToggleButton>
              </ToggleButtonGroup>
            </FieldShell>
          );
        } else {
          content = (
            <h1 style={{ color: "#e53c05" }}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              &nbsp;
              <Link
                component={RouterLink}
                to={`/schema/${modelZUID}/field/${repeaterFieldItemZUID}`}
              >
                The <em>{field?.label}</em> field is missing option settings.
                Edit the field to add yes/no values.
              </Link>
            </h1>
          );
        }
        break;

      case "dropdown":
        const dropdownOptions = useMemo(() => {
          return field?.settings?.options
            ? Object.keys(field?.settings?.options).map((name) => {
                return {
                  value: name,
                  text: field?.settings?.options[name],
                };
              })
            : [];
        }, [field?.settings?.options]);

        content = (
          <FieldShell settings={field} errors={errors} withComment={false}>
            <Autocomplete
              clearOnBlur
              disablePortal
              options={dropdownOptions}
              value={
                dropdownOptions.find((option) => option.value === value) || null
              }
              onChange={(_, newValue) =>
                onChange(newValue?.value || "", field?.name)
              }
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              getOptionLabel={(option) => option.text || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name={field?.name}
                  placeholder="Select"
                  variant="outlined"
                  error={hasError}
                />
              )}
            />
          </FieldShell>
        );
        break;

      case "color":
        content = (
          <Box maxWidth={300}>
            <FieldShell settings={field} errors={errors} withComment={false}>
              <FieldTypeColor
                name={field?.name}
                value={value || "#FFFFFF"}
                onChange={(evt) => onChange(evt.target.value, field?.name)}
                error={hasError}
              />
            </FieldShell>
          </Box>
        );
        break;

      case "number":
        content = (
          <FieldShell settings={field} errors={errors} withComment={false}>
            <FieldTypeNumber
              value={+value || 0}
              name={field?.name}
              required={field?.required}
              onChange={onChange}
              hasError={hasError}
            />
          </FieldShell>
        );
        break;

      case "currency":
        content = (
          <FieldShell
            settings={field}
            customTooltip={`View this value in different currencies based upon your locale "${window.navigator.language}"`}
            errors={errors}
            withComment={false}
          >
            <FieldTypeCurrency
              name={field?.name}
              currency={field?.settings?.currency ?? "USD"}
              value={String(value)}
              onChange={onChange}
              error={hasError}
            />
          </FieldShell>
        );
        break;

      case "sort":
        content = (
          <FieldShell settings={field} errors={errors} withComment={false}>
            <FieldTypeSort
              name={field?.name}
              required={field?.required}
              value={value?.toString() || "0"}
              onChange={(evt) => {
                onChange(parseInt(evt.target.value) || 0, field?.name);
              }}
              error={hasError}
            />
          </FieldShell>
        );
        break;

      case "date": {
        const d = value ? new Date((value as string) + "T00:00:00") : null;
        const parsedDate = d && isValid(d) ? d : null;
        content = (
          <FieldShell settings={field} errors={errors} withComment={false}>
            <FieldTypeDate
              name={field.name}
              required={field.required}
              value={parsedDate}
              onChange={(date) => {
                onChange(date ? format(date, "yyyy-MM-dd") : null, field.name);
              }}
              error={hasError}
            />
          </FieldShell>
        );
        break;
      }

      case "datetime":
        content = (
          <FieldShell settings={field} errors={errors} withComment={false}>
            <Box maxWidth={360}>
              <FieldTypeDateTime
                name={field.name}
                required={field.required}
                value={(value as string) ?? ""}
                onChange={(datetime) => {
                  onChange(datetime, field.name);
                }}
                error={hasError}
              />
            </Box>
          </FieldShell>
        );
        break;

      default:
        content = (
          <Link
            component={RouterLink}
            to={`/schema/${modelZUID}/field/${repeaterFieldItemZUID}`}
          >
            Failed loading {field.label} field. Click here to view field schema.
          </Link>
        );
        break;
    }

    return <div data-cy={`subfield:${field?.name}`}>{content}</div>;
  }
);

SubField.displayName = "SubField";
