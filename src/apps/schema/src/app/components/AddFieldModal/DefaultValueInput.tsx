import {
  TextField,
  Dialog,
  Menu,
  MenuItem,
  Button,
  Chip,
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
import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems, searchItems } from "../../../../../../shell/store/content";
import {
  FieldTypeOneToMany,
  OneToManyOptions,
} from "../../../../../../shell/components/FieldTypeOneToMany";
import { AppState } from "../../../../../../shell/store/types";
import { FieldSettingsOptions } from "../../../../../../shell/services/types";
import { FieldTypeOneToOne } from "../../../../../../shell/components/FieldTypeOneToOne";
import {
  resolveRelatedOptions,
  sortHTML,
} from "../../../../../content-editor/src/app/components/Editor/Field/Field";
import { fetchFields } from "../../../../../../shell/store/fields";
import { FieldTypeInternalLink } from "../../../../../../shell/components/FieldTypeInternalLink";
import { LinkOption } from "../../../../../content-editor/src/app/components/Editor/Field/LinkOption";
import { FieldTypeNumber } from "../../../../../../shell/components/FieldTypeNumber";
import { FieldTypeCurrencyV2 as FieldTypeCurrency } from "../../../../../../shell/components/FieldTypeCurrency";
import { FieldTypeDate } from "../../../../../../shell/components/FieldTypeDate";
import { FieldTypeDateTime } from "../../../../../../shell/components/FieldTypeDateTime";
import { FieldTypeColor } from "../../../../../../shell/components/FieldTypeColor";
import { FieldTypeSort } from "../../../../../../shell/components/FieldTypeSort";
import moment from "moment";

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
      const onOneToOneOpen = () => {
        return dispatch(
          fetchItems(relatedModelZUID, {
            lang: "en-US",
          })
        );
      };

      let oneToOneOptions: OneToManyOptions[] = useMemo(() => {
        const filterValidItems = (items: any) => {
          // remove items that are only saved in memory
          const filteredValidItems = Object.entries<any>(items).filter(
            ([, value]) => value.web.version
          );
          // Reshape the array back into an object
          let options = Object.fromEntries(filteredValidItems);

          return options;
        };
        const options = filterValidItems(allItems);

        return [
          {
            inputLabel: "- None -",
            value: null,
            component: "- None -",
          },
          ...resolveRelatedOptions(
            allFields,
            options,
            relatedFieldZUID,
            relatedModelZUID,
            1,
            value
          ),
        ];
      }, [
        Object.keys(allFields).length,
        Object.keys(allItems).length,
        relatedModelZUID,
        relatedFieldZUID,
        value,
      ]);

      if (value && !oneToOneOptions.find((opt) => opt.value === value)) {
        //the related option is not in the array, we need to insert it
        oneToOneOptions.unshift({
          value: value as string,
          inputLabel: `Selected item not found: ${value}`,
          component: (
            <span>
              <span onClick={(evt) => evt.stopPropagation()}>
                <AppLink
                  style={{
                    textShadow: "none",
                  }}
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
          data-cy="DefaultValueInput"
          name={"defaultValue"}
          value={
            oneToOneOptions?.find((options) => options.value === value) || null
          }
          onChange={(_, option) => onChange(option.value)}
          options={oneToOneOptions}
          // @ts-ignore
          onOpen={onOneToOneOpen}
          startAdornment={
            value && (
              <AppLink to={`/content/${relatedModelZUID}/${value}`}>
                <FontAwesomeIcon icon={faEdit} />
              </AppLink>
            )
          }
          endAdornment={value && <em>en-US</em>}
          error={error}
        />
      );
    case "one_to_many":
      const oneToManyOptions: OneToManyOptions[] = useMemo(() => {
        const filterValidItems = (items: any) => {
          // remove items that are only saved in memory
          const filteredValidItems = Object.entries<any>(items).filter(
            ([, value]) => value.web.version
          );
          // Reshape the array back into an object
          let options = Object.fromEntries(filteredValidItems);

          return options;
        };
        const options = filterValidItems(allItems);

        return resolveRelatedOptions(
          allFields,
          options,
          relatedFieldZUID,
          relatedModelZUID,
          1,
          value
        );
      }, [
        Object.keys(allFields).length,
        Object.keys(allItems).length,
        relatedModelZUID,
        relatedFieldZUID,
        1,
        value,
      ]);
      const onOneToManyOpen = useCallback(() => {
        return Promise.all([
          dispatch(fetchFields(relatedModelZUID)),
          dispatch(
            fetchItems(relatedModelZUID, {
              lang: "en-US",
            })
          ),
        ]);
      }, [relatedModelZUID]);

      return (
        <FieldTypeOneToMany
          data-cy="DefaultValueInput"
          name={"defaultValue"}
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
          onChange={(_, options: OneToManyOptions[]) => {
            const selectedOptions = options?.length
              ? options.map((option) => option.value).join(",")
              : null;
            onChange(selectedOptions);
          }}
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
          error={error}
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
        (term) => dispatch(searchItems(term)),
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
          value={value ? moment(value as string).toDate() : null}
          onChange={(date) => {
            onChange(date ? moment(date).format("yyyy-MM-DD") : null);
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
