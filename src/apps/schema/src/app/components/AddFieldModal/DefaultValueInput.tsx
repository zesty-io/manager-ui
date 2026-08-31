import {
  TextField,
  Dialog,
  Menu,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Select,
} from "@mui/material";
import { FormValue } from "./views/FieldForm";
import { useCallback, useMemo, useState } from "react";
import { MaxLengths } from "../../../../../content-editor/src/app/components/Editor/Editor";
import { FieldTypeTinyMCE } from "../../../../../../shell/components/FieldTypeTinyMCE";
import { MemoryRouter } from "react-router";
import { IconButton } from "@zesty-io/material";
import { GridCloseIcon } from "@mui/x-data-grid-pro";
import { MediaApp } from "../../../../../media/src/app";
import { FieldTypeEditor } from "../../../../../../shell/components/FieldTypeEditor";
import {
  EditorType,
  EditorTypes,
} from "../../../../../content-editor/src/app/components/Editor/Field/FieldShell";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { FieldTypeMedia } from "../../../../../content-editor/src/app/components/FieldTypeMedia";

import { useDispatch, useSelector } from "react-redux";
import { searchItems } from "../../../../../../shell/store/content";

import { AppState } from "../../../../../../shell/store/types";
import { FieldSettingsOptions } from "../../../../../../shell/services/types";
import { sortHTML } from "../../../../../content-editor/src/app/components/Editor/Field/Field";
import { FieldTypeInternalLink } from "../../../../../../shell/components/FieldTypeInternalLink";
import { LinkOption } from "../../../../../content-editor/src/app/components/Editor/Field/LinkOption";
import { FieldTypeNumber } from "../../../../../../shell/components/FieldTypeNumber";
import { FieldTypeCurrency } from "../../../../../../shell/components/FieldTypeCurrency";
import { FieldTypeDate } from "../../../../../../shell/components/FieldTypeDate";
import { FieldTypeDateTime } from "../../../../../../shell/components/FieldTypeDateTime";
import { FieldTypeColor } from "../../../../../../shell/components/FieldTypeColor";
import { FieldTypeSort } from "../../../../../../shell/components/FieldTypeSort";
import { RelationalFieldBase } from "../../../../../../shell/components/RelationalFieldBase";
import { parse, format, isValid } from "date-fns";
import { parseInt } from "lodash";

type DefaultValueInputProps = {
  type: string;
  value: FormValue;
  onChange: (value: FormValue) => void;
  error: boolean;
  mediaRules: {
    limit: FormValue;
    group_id: FormValue;
  };
  relationshipFields: {
    relatedModelZUID: string;
    relatedFieldZUID: string;
  };
  options: FieldSettingsOptions[];
  currency?: string;
  fieldLabel: string;
};

export const DefaultValueInput = ({
  type,
  value,
  onChange,
  error,
  mediaRules,
  relationshipFields: { relatedModelZUID, relatedFieldZUID },
  options,
  currency,
  fieldLabel,
}: DefaultValueInputProps) => {
  const [imageModal, setImageModal] = useState(null);
  const dispatch = useDispatch();
  const allItems = useSelector((state: AppState) => state.content);
  const allFields = useSelector((state: AppState) => state.fields);
  switch (type) {
    case "text":
    case "fontawesome":
      return (
        <TextField
          data-cy="DefaultValueInput"
          error={error}
          value={value || ""}
          onChange={(evt) => onChange(evt.target.value)}
          fullWidth
          inputProps={{
            maxLength: MaxLengths[type],
          }}
        />
      );
    case "textarea":
      return (
        <TextField
          data-cy="DefaultValueInput"
          error={error}
          value={value || ""}
          onChange={(evt) => onChange(evt.target.value)}
          fullWidth
          inputProps={{
            maxLength: MaxLengths[type],
          }}
          multiline
          rows={6}
        />
      );
    case "wysiwyg_advanced":
    case "wysiwyg_basic":
      return (
        <>
          <FieldTypeTinyMCE
            data-cy="DefaultValueInput"
            name="defaultValue"
            value={value || ""}
            onChange={(value) => {
              onChange(value);
            }}
            datatype={type}
            mediaBrowser={(opts: any) => {
              setImageModal(opts);
            }}
            error={error}
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
                  <GridCloseIcon sx={{ color: "common.white" }} />
                </IconButton>
                <MediaApp
                  isSelectDialog={true}
                  showHeaderActions={false}
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

    case "markdown":
    case "article_writer":
      const [editorType, setEditorType] = useState<EditorType>("markdown");
      const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
      return (
        <>
          <Button
            size="xsmall"
            variant="contained"
            color="inherit"
            endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />}
            sx={{
              width: "fit-content",
              ml: "auto",
              mb: 0.5,
              height: 20,
              backgroundColor: "common.white",
              p: 0,
              color: "text.disabled",

              "&:hover": {
                backgroundColor: "common.white",
                boxShadow: "none",
              },

              "&:active": {
                boxShadow: "none",
              },
              "& .MuiButton-endIcon": {
                ml: 0.5,
              },
            }}
            onClick={(evt) => {
              setAnchorEl(evt.currentTarget);
            }}
          >
            {EditorTypes[editorType]}
          </Button>
          <Menu
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            {Object.entries(EditorTypes).map(([key, value]) => (
              <MenuItem
                key={key}
                onClick={() => {
                  setAnchorEl(null);
                  setEditorType(key as EditorType);
                }}
              >
                {value}
              </MenuItem>
            ))}
          </Menu>
          <FieldTypeEditor
            data-cy="DefaultValueInput"
            // @ts-ignore component not typed
            name={"defaultValue"}
            value={value || ""}
            onChange={onChange}
            datatype={type}
            mediaBrowser={(opts: any) => {
              setImageModal(opts);
            }}
            editor={editorType}
            error={error}
          />
        </>
      );

    case "files":
    case "images":
      const images = useMemo(
        () => ((value as string) || "").split(",").filter((el: string) => el),
        [value]
      );
      return (
        <>
          <FieldTypeMedia
            data-cy="DefaultValueInput"
            hasError={error}
            limit={(mediaRules?.limit as number) || 1}
            images={images}
            openMediaBrowser={(opts: any) => {
              setImageModal({
                ...opts,
                locked: Boolean(
                  mediaRules?.group_id && mediaRules?.group_id != "0"
                ),
              });
            }}
            name={"defaultValue"}
            onChange={onChange}
            lockedToGroupId={
              mediaRules?.group_id && mediaRules?.group_id !== "0"
                ? (mediaRules?.group_id as string)
                : null
            }
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
                  <GridCloseIcon sx={{ color: "common.white" }} />
                </IconButton>
                <MediaApp
                  limitSelected={+mediaRules?.limit - images.length}
                  isSelectDialog={true}
                  showHeaderActions={false}
                  lockedToGroupId={
                    mediaRules?.group_id && mediaRules?.group_id !== "0"
                      ? (mediaRules?.group_id as string)
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
    case "one_to_one":
      return (
        <RelationalFieldBase
          name="defaultValue"
          fieldZUID="newDefaultValue"
          value={!!value ? String(value) : null}
          relatedModelZUID={relatedModelZUID}
          relatedFieldZUID={relatedFieldZUID}
          onChange={(value) => onChange(value)}
          fieldLabel={fieldLabel}
        />
      );
    case "one_to_many":
      return (
        <RelationalFieldBase
          name="defaultValue"
          fieldZUID="newDefaultValue"
          multiselect
          value={!!value ? String(value) : null}
          relatedModelZUID={relatedModelZUID}
          relatedFieldZUID={relatedFieldZUID}
          onChange={(value) => onChange(value)}
          fieldLabel={fieldLabel}
        />
      );
    case "link":
      return (
        <TextField
          data-cy="DefaultValueInput"
          value={value || ""}
          onChange={(evt) => onChange(evt.target.value)}
          fullWidth
          type="url"
          error={error}
        />
      );

    case "internal_link":
      let internalLinkRelatedItem = allItems[value as any];
      let internalLinkOptions = useMemo(() => {
        return Object.keys(allItems)
          .filter(
            (itemZUID) =>
              !itemZUID.includes("new") && // exclude new items
              allItems[itemZUID].meta.ZUID && // ensure the item has a zuid
              allItems[itemZUID].web.pathPart && // exclude non-routeable items
              allItems[itemZUID].meta.langID === 1 // exclude non-relevant langs
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
        (term: string) => dispatch(searchItems(term)),
        []
      );
      return (
        <FieldTypeInternalLink
          data-cy="DefaultValueInput"
          // @ts-ignore component not typed
          name={"defaultValue"}
          value={value}
          onChange={(value: string) => onChange(value)}
          onSearch={onInternalLinkSearch}
          options={internalLinkOptions}
          error={error}
        />
      );

    case "number":
      return (
        <FieldTypeNumber
          data-cy="DefaultValueInput"
          value={+value || 0}
          name={"defaultValue"}
          onChange={onChange}
          hasError={error}
          required={true}
        />
      );
    case "currency":
      return (
        <FieldTypeCurrency
          data-cy="DefaultValueInput"
          name="defaultValue"
          value={String(value)}
          onChange={onChange}
          error={error}
          currency={currency}
        />
      );
    case "date":
      return (
        <FieldTypeDate
          data-cy="DefaultValueInput"
          name={"defaultValue"}
          required
          value={
            value ? parse(value as string, "yyyy-MM-dd", new Date()) : null
          }
          onChange={(date) => {
            onChange(date && isValid(date) ? format(date, "yyyy-MM-dd") : null);
          }}
          error={error}
        />
      );

    case "datetime":
      return (
        <FieldTypeDateTime
          data-cy="DefaultValueInput"
          name={"defaultValue"}
          required
          value={(value as string) ?? null}
          onChange={(datetime) => {
            onChange(datetime);
          }}
          error={error}
        />
      );

    case "yes_no":
      return (
        <ToggleButtonGroup
          data-cy="DefaultValueInput"
          color="primary"
          size="small"
          value={value}
          exclusive
          onChange={(_, val) => {
            if (val !== null) {
              onChange(val);
            }
          }}
        >
          <ToggleButton
            value={0}
            sx={{
              borderColor: error ? "error.main" : "rgba(0, 0, 0, 0.12)",
            }}
          >
            {options?.[0]?.[0] || "No"}
          </ToggleButton>
          <ToggleButton
            value={1}
            sx={{
              borderColor: error ? "error.main" : "rgba(0, 0, 0, 0.12)",
            }}
          >
            {options?.[1]?.[1] || "Yes"}
          </ToggleButton>
        </ToggleButtonGroup>
      );

    case "dropdown":
      return (
        <Select
          data-cy="DefaultValueInput"
          name={"defaultValue"}
          variant="outlined"
          displayEmpty
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        >
          <MenuItem value="">Select</MenuItem>
          {options.map((option, i) => {
            const key = Object.keys(option)[0];
            const value = Object.values(option)[0];
            return (
              <MenuItem key={i} value={key}>
                {value}
              </MenuItem>
            );
          })}
        </Select>
      );
    case "color":
      return (
        <FieldTypeColor
          data-cy="DefaultValueInput"
          name={"defaultValue"}
          value={value || "#FFFFFF"}
          onChange={(evt) => onChange(evt.target.value)}
          error={error}
        />
      );
    case "sort":
      return (
        <FieldTypeSort
          data-cy="DefaultValueInput"
          name={"defaultValue"}
          required
          value={value?.toString() || "0"}
          onChange={(evt) => {
            onChange(parseInt(evt.target.value) || 0);
          }}
          error={error}
        />
      );
    default:
      return null;
  }
};
