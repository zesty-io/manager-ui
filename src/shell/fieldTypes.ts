import { SvgIconComponent } from "@mui/icons-material";
import TitleRounded from "@mui/icons-material/TitleRounded";
import SubjectRounded from "@mui/icons-material/SubjectRounded";
import NewspaperRounded from "@mui/icons-material/NewspaperRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import DocumentScannerRounded from "@mui/icons-material/DocumentScannerRounded";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import AttachmentRounded from "@mui/icons-material/AttachmentRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import CalendarTodayRounded from "@mui/icons-material/CalendarTodayRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import PinRounded from "@mui/icons-material/PinRounded";
import TagRounded from "@mui/icons-material/TagRounded";
import ToggleOnRounded from "@mui/icons-material/ToggleOnRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ColorLensRounded from "@mui/icons-material/ColorLensRounded";
import FormatListNumberedRounded from "@mui/icons-material/FormatListNumberedRounded";
import InsertEmoticonRounded from "@mui/icons-material/InsertEmoticonRounded";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { Markdown, OneToOne, Block, Repeater } from "@zesty-io/material";

// Single registry for everything the manager knows about a content field
// datatype: label, icon, colour, group and list membership. Schema, the
// content list and Studio all read from here so a type looks the same
// everywhere. Typed as Record<FieldType, ...>, so adding a datatype to
// FieldType without an entry here is a compile error.
export type FieldType =
  | "text"
  | "textarea"
  | "wysiwyg_basic"
  | "markdown"
  | "images"
  | "one_to_one"
  | "one_to_many"
  | "link"
  | "internal_link"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "yes_no"
  | "dropdown"
  | "color"
  | "sort"
  | "uuid"
  | "files"
  | "fontawesome"
  | "wysiwyg_advanced"
  | "article_writer"
  | "block_selector" // TODO: Will need to confirm if this type is already supported by the api
  | "integration"
  | "repeater";

export type FieldGroup =
  | "text"
  | "media"
  | "relationship"
  | "numeric"
  | "dateandtime"
  | "options";

// Which kind of Studio slot a field can be bound to: "text" for inline text,
// "media" for img/video sources, null when it can't be bound.
export type StudioSlot = "text" | "media" | null;

export type FieldTypeMeta = {
  // i18n key, not display text: t() cannot run at module scope, so callers
  // resolve it with t(meta.label).
  label: string;
  icon: SvgIconComponent;
  // The paper clip icon reads better rotated
  rotateIcon?: boolean;
  // Theme palette paths, usable directly in sx
  color: { bg: string; fg: string };
  group: FieldGroup;
  textLike: boolean;
  richText: boolean;
  inlineEditable: boolean;
  filterable: boolean;
  studioSlot: StudioSlot;
  formatForDisplay?: (value: unknown) => string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
});

export const formatDateTime = (source: string) => {
  if (!source) return "";

  const dateObj = new Date(source);
  if (isNaN(dateObj.getTime())) return "";

  const date = dateFormatter.format(dateObj);
  const time = timeFormatter.format(dateObj);

  return `${date} ${time}`;
};

export const formatDate = (source: string) => {
  if (!source) return "";

  const dateObj = new Date(source);
  if (isNaN(dateObj.getTime())) return "";

  return dateFormatter.format(dateObj);
};

// Only null, undefined and "" render blank; 0 is a real value.
export const formatNumber = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  return new Intl.NumberFormat("en-US").format(Number(value));
};

const GREEN_TEXT = { bg: "green.50", fg: "green.600" };
const GREEN_RICH = { bg: "green.50", fg: "green.500" };
const BLUE = { bg: "blue.50", fg: "blue.500" };
const PINK = { bg: "pink.50", fg: "pink.600" };
const RED = { bg: "red.50", fg: "red.600" };
const ORANGE = { bg: "deepOrange.50", fg: "deepOrange.500" };
const PURPLE = { bg: "purple.50", fg: "purple.700" };

export const FIELD_TYPES: Record<FieldType, FieldTypeMeta> = {
  text: {
    label: "shell.fieldTypeText",
    icon: TitleRounded,
    color: GREEN_TEXT,
    group: "text",
    textLike: true,
    richText: false,
    inlineEditable: true,
    filterable: true,
    studioSlot: "text",
  },
  textarea: {
    label: "shell.fieldTypeTextarea",
    icon: SubjectRounded,
    color: GREEN_TEXT,
    group: "text",
    textLike: true,
    richText: false,
    inlineEditable: true,
    filterable: true,
    studioSlot: "text",
  },
  wysiwyg_basic: {
    label: "shell.fieldTypeWysiwygBasic",
    icon: NewspaperRounded,
    color: GREEN_RICH,
    group: "text",
    textLike: true,
    richText: true,
    inlineEditable: true,
    filterable: true,
    studioSlot: "text",
  },
  wysiwyg_advanced: {
    label: "shell.fieldTypeWysiwygAdvanced",
    icon: NewspaperRounded,
    color: GREEN_RICH,
    group: "text",
    textLike: true,
    richText: true,
    inlineEditable: true,
    filterable: true,
    studioSlot: "text",
  },
  article_writer: {
    label: "shell.fieldTypeArticleWriter",
    icon: NewspaperRounded,
    color: GREEN_RICH,
    group: "text",
    textLike: true,
    richText: true,
    inlineEditable: true,
    filterable: true,
    studioSlot: "text",
  },
  markdown: {
    label: "shell.fieldTypeMarkdown",
    icon: Markdown as SvgIconComponent,
    color: GREEN_RICH,
    group: "text",
    textLike: true,
    richText: true,
    inlineEditable: true,
    filterable: true,
    studioSlot: "text",
  },
  images: {
    label: "shell.fieldTypeImages",
    icon: AttachmentRounded,
    rotateIcon: true,
    color: BLUE,
    group: "media",
    textLike: false,
    richText: false,
    inlineEditable: true,
    filterable: true,
    studioSlot: "media",
  },
  files: {
    label: "shell.fieldTypeFiles",
    icon: AttachmentRounded,
    rotateIcon: true,
    color: BLUE,
    group: "media",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: false,
    studioSlot: null,
  },
  one_to_one: {
    label: "shell.fieldTypeOneToOne",
    icon: OneToOne as SvgIconComponent,
    color: PINK,
    group: "relationship",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
  },
  one_to_many: {
    label: "shell.fieldTypeOneToMany",
    icon: AccountTreeRounded,
    color: PINK,
    group: "relationship",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
  },
  link: {
    label: "shell.fieldTypeLink",
    icon: LinkRounded,
    color: PINK,
    group: "relationship",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "media",
  },
  internal_link: {
    label: "shell.fieldTypeInternalLink",
    icon: DocumentScannerRounded,
    color: PINK,
    group: "relationship",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
  },
  block_selector: {
    label: "shell.fieldTypeBlockSelector",
    icon: Block as SvgIconComponent,
    color: PINK,
    group: "relationship",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
  },
  number: {
    label: "shell.fieldTypeNumber",
    icon: PinRounded,
    color: RED,
    group: "numeric",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "text",
    formatForDisplay: formatNumber,
  },
  currency: {
    label: "shell.fieldTypeCurrency",
    icon: PaymentsRounded,
    color: RED,
    group: "numeric",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "text",
  },
  date: {
    label: "shell.fieldTypeDate",
    icon: CalendarTodayRounded,
    color: ORANGE,
    group: "dateandtime",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
    formatForDisplay: (value) => formatDate(value as string),
  },
  datetime: {
    label: "shell.fieldTypeDatetime",
    icon: ScheduleRounded,
    color: ORANGE,
    group: "dateandtime",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
    formatForDisplay: (value) => formatDateTime(value as string),
  },
  yes_no: {
    label: "shell.fieldTypeYesNo",
    icon: ToggleOnRounded,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: null,
  },
  dropdown: {
    label: "shell.fieldTypeDropdown",
    icon: KeyboardArrowDownRounded,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "text",
  },
  color: {
    label: "shell.fieldTypeColor",
    icon: ColorLensRounded,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "text",
  },
  sort: {
    label: "shell.fieldTypeSort",
    icon: FormatListNumberedRounded,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "text",
  },
  uuid: {
    label: "shell.fieldTypeUuid",
    icon: TagRounded,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: true,
    studioSlot: "text",
  },
  fontawesome: {
    label: "shell.fieldTypeFontawesome",
    icon: InsertEmoticonRounded,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: false,
    studioSlot: null,
  },
  integration: {
    label: "shell.fieldTypeIntegration",
    icon: DataObjectIcon,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: false,
    studioSlot: null,
  },
  repeater: {
    label: "shell.fieldTypeRepeater",
    icon: Repeater as SvgIconComponent,
    color: PURPLE,
    group: "options",
    textLike: false,
    richText: false,
    inlineEditable: false,
    filterable: false,
    studioSlot: null,
  },
};

// Unknown datatypes get the generic paper clip.
export const UNKNOWN_FIELD_TYPE_META: FieldTypeMeta = {
  label: "",
  icon: AttachmentRounded,
  rotateIcon: true,
  color: { bg: "grey.100", fg: "grey.700" },
  group: "options",
  textLike: false,
  richText: false,
  inlineEditable: false,
  filterable: false,
  studioSlot: null,
};

export const isFieldType = (x: unknown): x is FieldType =>
  typeof x === "string" && Object.prototype.hasOwnProperty.call(FIELD_TYPES, x);

export const getFieldTypeMeta = (datatype?: string | null): FieldTypeMeta =>
  isFieldType(datatype) ? FIELD_TYPES[datatype] : UNKNOWN_FIELD_TYPE_META;

const flag =
  (key: "filterable" | "textLike" | "richText" | "inlineEditable") =>
  (datatype?: string | null): boolean =>
    isFieldType(datatype) ? FIELD_TYPES[datatype][key] : false;

export const isFilterableFieldType = flag("filterable");
export const isTextLikeFieldType = flag("textLike");
export const isRichTextFieldType = flag("richText");
export const isInlineEditableFieldType = flag("inlineEditable");
