import {
  FieldGroup,
  FieldType,
  StudioSlot,
  getFieldTypeMeta,
} from "shell/fieldTypes";

// How a content field's datatype is presented in Studio. Icon, colour, group
// and slot membership all come from the shared registry (shell/fieldTypes) so
// Studio, Schema and the content list never drift; only the dropdown
// description lives here.
export type FieldDatatypeMeta = {
  Icon: ReturnType<typeof getFieldTypeMeta>["icon"];
  rotateIcon: boolean;
  // Theme palette paths, usable directly in sx
  color: { bg: string; fg: string };
  group: FieldGroup;
  studioSlot: StudioSlot;
  // One-line "what is this field" shown under the name in the dropdown.
  // NOTE: this is an i18n key, not display text — t() cannot run at module
  // scope, so callers must resolve it with t(meta.description) themselves.
  description: string;
};

const FIELD_DESCRIPTIONS: Partial<Record<FieldType, string>> = {
  text: "content.fieldMetaTextDescription",
  textarea: "content.fieldMetaTextareaDescription",
  wysiwyg_basic: "content.fieldMetaWysiwygDescription",
  wysiwyg_advanced: "content.fieldMetaWysiwygDescription",
  article_writer: "content.fieldMetaArticleWriterDescription",
  markdown: "content.fieldMetaMarkdownDescription",
  number: "content.fieldMetaNumberDescription",
  currency: "content.fieldMetaCurrencyDescription",
  yes_no: "content.fieldMetaYesNoDescription",
  dropdown: "content.fieldMetaDropdownDescription",
  color: "content.fieldMetaColorDescription",
  sort: "content.fieldMetaSortDescription",
  uuid: "content.fieldMetaUuidDescription",
  images: "content.fieldMetaImagesDescription",
  one_to_one: "content.fieldMetaOneToOneDescription",
  one_to_many: "content.fieldMetaOneToManyDescription",
  internal_link: "content.fieldMetaInternalLinkDescription",
  link: "content.fieldMetaLinkDescription",
  date: "content.fieldMetaDateDescription",
  datetime: "content.fieldMetaDatetimeDescription",
  block_selector: "content.fieldMetaBlockSelectorDescription",
  repeater: "content.fieldMetaRepeaterDescription",
};

export const getFieldMeta = (datatype?: string | null): FieldDatatypeMeta => {
  const meta = getFieldTypeMeta(datatype);
  return {
    Icon: meta.icon,
    rotateIcon: !!meta.rotateIcon,
    color: meta.color,
    group: meta.group,
    studioSlot: meta.studioSlot,
    description: FIELD_DESCRIPTIONS[datatype as FieldType] || "",
  };
};

// Whether a text slot's "Connect Item" dropdown should offer this field. Only
// scalar fields that render as inline text qualify (the registry's "text"
// studioSlot); media, relationships, dates, blocks, repeaters and unknown
// types are excluded since they don't emit clean inline text.
export const isTextReferenceableDatatype = (
  datatype?: string | null
): boolean => getFieldMeta(datatype).studioSlot === "text";

// Whether a media slot's (img/video src, poster) "Connect Item" dropdown should
// offer this field: a media asset (resolved to a URL via getImage()) or an
// external-URL field (used verbatim). See buildParsley in ./studioParsley for
// the difference.
export const isMediaSlotDatatype = (datatype?: string | null): boolean =>
  getFieldMeta(datatype).studioSlot === "media";

// Whether a content model renders a page of its own. `getUrl()` returns an
// item's relative URL and only exists for models WITH a view, so a dataset or a
// block item would resolve to nothing — the link item picker leaves them out
// rather than let someone bind an href that can never resolve.
export const isRoutedModelType = (type?: string | null): boolean =>
  type === "templateset" || type === "pageset";
