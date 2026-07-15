import TitleRounded from "@mui/icons-material/TitleRounded";
import SubjectRounded from "@mui/icons-material/SubjectRounded";
import NewspaperRounded from "@mui/icons-material/NewspaperRounded";
import NotesRounded from "@mui/icons-material/NotesRounded";
import AttachmentRounded from "@mui/icons-material/AttachmentRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import DocumentScannerRounded from "@mui/icons-material/DocumentScannerRounded";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import CalendarTodayRounded from "@mui/icons-material/CalendarTodayRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import PinRounded from "@mui/icons-material/PinRounded";
import NumbersRounded from "@mui/icons-material/NumbersRounded";
import ToggleOnRounded from "@mui/icons-material/ToggleOnRounded";
import ColorLensRounded from "@mui/icons-material/ColorLensRounded";
import FormatListNumberedRounded from "@mui/icons-material/FormatListNumberedRounded";
import WidgetsRounded from "@mui/icons-material/WidgetsRounded";
import AutoAwesomeMotionRounded from "@mui/icons-material/AutoAwesomeMotionRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";

type FieldIcon = typeof TitleRounded;

// The colour families the field-type chip uses in the Connect Item dropdown,
// straight from the Figma. text/number/options are offered on text slots;
// media + link on img/video slots; anything else gets the neutral chip.
type FieldCategory =
  | "text"
  | "number"
  | "options"
  | "media"
  | "link"
  | "neutral";

export type FieldDatatypeMeta = {
  Icon: FieldIcon;
  category: FieldCategory;
  // One-line "what is this field" shown under the name in the dropdown.
  description: string;
};

// Single source of truth for how a content field's datatype is presented in
// Studio — the Layers tree icon AND the Connect Item dropdown both read this,
// so the two never drift. Keyed by Zesty datatype.
const FIELD_DATATYPE_META: Record<string, FieldDatatypeMeta> = {
  text: {
    Icon: TitleRounded,
    category: "text",
    description: "Titles, names, and headings",
  },
  textarea: {
    Icon: SubjectRounded,
    category: "text",
    description: "Plain multi-line text",
  },
  wysiwyg_basic: {
    Icon: NewspaperRounded,
    category: "text",
    description: "Rich text with formatting",
  },
  wysiwyg_advanced: {
    Icon: NewspaperRounded,
    category: "text",
    description: "Rich text with formatting",
  },
  article_writer: {
    Icon: NewspaperRounded,
    category: "text",
    description: "Long-form article content",
  },
  markdown: {
    Icon: NotesRounded,
    category: "text",
    description: "Markdown-formatted text",
  },
  number: {
    Icon: PinRounded,
    category: "number",
    description: "Whole or decimal numbers",
  },
  currency: {
    Icon: PaymentsRounded,
    category: "number",
    description: "Monetary values",
  },
  yes_no: {
    Icon: ToggleOnRounded,
    category: "options",
    description: "A true / false toggle",
  },
  dropdown: {
    Icon: KeyboardArrowDownRounded,
    category: "options",
    description: "A single choice from a list",
  },
  color: {
    Icon: ColorLensRounded,
    category: "options",
    description: "A colour value",
  },
  sort: {
    Icon: FormatListNumberedRounded,
    category: "options",
    description: "A manual sort order",
  },
  uuid: {
    Icon: NumbersRounded,
    category: "options",
    description: "A unique identifier",
  },
  images: {
    // A media field feeds both <img> and <video> sources, so the generic
    // attachment icon reads better here than an image-specific one.
    Icon: AttachmentRounded,
    category: "media",
    description: "Media from the asset library",
  },
  one_to_one: {
    Icon: AccountTreeRounded,
    category: "neutral",
    description: "A link to one related item",
  },
  one_to_many: {
    Icon: AccountTreeRounded,
    category: "neutral",
    description: "Links to related items",
  },
  internal_link: {
    Icon: DocumentScannerRounded,
    category: "neutral",
    description: "A link to another page",
  },
  link: {
    Icon: LinkRounded,
    category: "link",
    description: "An external URL",
  },
  date: {
    Icon: CalendarTodayRounded,
    category: "neutral",
    description: "A calendar date",
  },
  datetime: {
    Icon: ScheduleRounded,
    category: "neutral",
    description: "A date and time",
  },
  block_selector: {
    Icon: WidgetsRounded,
    category: "neutral",
    description: "A reusable content block",
  },
  repeater: {
    Icon: AutoAwesomeMotionRounded,
    category: "neutral",
    description: "A repeating group of fields",
  },
};

const DEFAULT_FIELD_META: FieldDatatypeMeta = {
  Icon: TitleRounded,
  category: "neutral",
  description: "",
};

export const getFieldMeta = (datatype?: string | null): FieldDatatypeMeta =>
  FIELD_DATATYPE_META[datatype || ""] || DEFAULT_FIELD_META;

// Whether a text slot's "Connect Item" dropdown should offer this field. Only
// scalar fields that render as inline text qualify — the text/number/options
// families from the Figma. Everything in the "neutral" family (media,
// relationships, dates, blocks, repeaters, unknown types) is excluded: those
// don't emit clean inline text, and media binding will live on the img/video
// nodes instead.
export const isTextReferenceableDatatype = (
  datatype?: string | null
): boolean => {
  const { category } = getFieldMeta(datatype);
  return category === "text" || category === "number" || category === "options";
};

// Whether a media slot's (img/video src, poster) "Connect Item" dropdown should
// offer this field: a media asset (resolved to a URL via getImage()) or an
// external-URL field (used verbatim). See fieldToParsley for the difference.
export const isMediaSlotDatatype = (datatype?: string | null): boolean => {
  const { category } = getFieldMeta(datatype);
  return category === "media" || category === "link";
};

// The Parsley reference for a field. A media asset needs getImage() to resolve
// to a URL; every other field (text, an external-URL link, …) is referenced
// verbatim. One rule covers both dropdowns: media slots mix the two, text slots
// only ever hold the plain form.
export const fieldToParsley = (
  name: string,
  datatype?: string | null
): string =>
  getFieldMeta(datatype).category === "media"
    ? `{{this.${name}.getImage()}}`
    : `{{this.${name}}}`;

// Chip fill / icon colour per category, from the Figma dropdown. Kept as literal
// hex because these are the design system's field-type tints, not MUI palette
// roles.
export const FIELD_CATEGORY_COLORS: Record<
  FieldCategory,
  { bg: string; fg: string }
> = {
  text: { bg: "#ECFDF3", fg: "#039855" },
  number: { bg: "#FEF3F2", fg: "#D92D20" },
  options: { bg: "#F4F3FF", fg: "#5925DC" },
  media: { bg: "#F0F9FF", fg: "#0BA5EC" },
  link: { bg: "#FDF2FA", fg: "#DD2590" },
  neutral: { bg: "#F2F4F7", fg: "#475467" },
};
