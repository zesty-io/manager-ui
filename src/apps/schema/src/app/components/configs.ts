import { InputField } from "./AddFieldModal/FieldFormInput";
import { ContentModelField } from "../../../../../shell/services/types";

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
interface FieldListData {
  type: FieldType;
  name: string;
  shortDescription: string;
  description: string;
  commonUses: string[];
  proTip: string;
  subHeaderText: string;
}
interface FormConfig {
  details: InputField[];
  rules: InputField[];
}
type SystemField = Pick<ContentModelField, "label" | "datatype" | "name">;
type TranslateFn = (key: string) => string;

const getFieldCopyConfig = (
  t: TranslateFn
): { [key: string]: FieldListData[] } => ({
  text: [
    {
      type: "text",
      name: t("schema.fieldTypeSingleLineTextName"),
      shortDescription: t("schema.fieldTypeSingleLineTextShortDesc"),
      description: t("schema.fieldTypeSingleLineTextDescription"),
      commonUses: [
        t("schema.fieldTypeSingleLineTextCommonUse1"),
        t("schema.fieldTypeSingleLineTextCommonUse2"),
        t("schema.fieldTypeSingleLineTextCommonUse3"),
        t("schema.fieldTypeSingleLineTextCommonUse4"),
        t("schema.fieldTypeSingleLineTextCommonUse5"),
      ],
      proTip: t("schema.fieldTypeSingleLineTextProTip"),
      subHeaderText: t("schema.fieldTypeSingleLineTextSubHeader"),
    },
    {
      type: "textarea",
      name: t("schema.fieldTypeMultiLineTextName"),
      shortDescription: t("schema.fieldTypeMultiLineTextShortDesc"),
      description: t("schema.fieldTypeMultiLineTextDescription"),
      commonUses: [
        t("schema.fieldTypeMultiLineTextCommonUse1"),
        t("schema.fieldTypeMultiLineTextCommonUse2"),
        t("schema.fieldTypeMultiLineTextCommonUse3"),
        t("schema.fieldTypeMultiLineTextCommonUse4"),
        t("schema.fieldTypeMultiLineTextCommonUse5"),
      ],
      proTip: t("schema.fieldTypeMultiLineTextProTip"),
      subHeaderText: t("schema.fieldTypeMultiLineTextSubHeader"),
    },
    {
      type: "wysiwyg_basic",
      name: t("schema.fieldTypeWysiwygName"),
      shortDescription: t("schema.fieldTypeWysiwygShortDesc"),
      description: t("schema.fieldTypeWysiwygDescription"),
      commonUses: [
        t("schema.fieldTypeWysiwygCommonUse1"),
        t("schema.fieldTypeWysiwygCommonUse2"),
        t("schema.fieldTypeWysiwygCommonUse3"),
        t("schema.fieldTypeWysiwygCommonUse4"),
        t("schema.fieldTypeWysiwygCommonUse5"),
      ],
      proTip: t("schema.fieldTypeWysiwygProTip"),
      subHeaderText: t("schema.fieldTypeWysiwygSubHeader"),
    },
    {
      type: "markdown",
      name: t("schema.fieldTypeMarkdownName"),
      shortDescription: t("schema.fieldTypeMarkdownShortDesc"),
      description: t("schema.fieldTypeMarkdownDescription"),
      commonUses: [
        t("schema.fieldTypeMarkdownCommonUse1"),
        t("schema.fieldTypeMarkdownCommonUse2"),
        t("schema.fieldTypeMarkdownCommonUse3"),
        t("schema.fieldTypeMarkdownCommonUse4"),
        t("schema.fieldTypeMarkdownCommonUse5"),
      ],
      proTip: t("schema.fieldTypeMarkdownProTip"),
      subHeaderText: t("schema.fieldTypeMarkdownSubHeader"),
    },
  ],
  media: [
    {
      type: "images",
      name: t("schema.fieldTypeMediaName"),
      shortDescription: t("schema.fieldTypeMediaShortDesc"),
      description: t("schema.fieldTypeMediaDescription"),
      commonUses: [
        t("schema.fieldTypeMediaCommonUse1"),
        t("schema.fieldTypeMediaCommonUse2"),
        t("schema.fieldTypeMediaCommonUse3"),
        t("schema.fieldTypeMediaCommonUse4"),
        t("schema.fieldTypeMediaCommonUse5"),
        t("schema.fieldTypeMediaCommonUse6"),
        t("schema.fieldTypeMediaCommonUse7"),
        t("schema.fieldTypeMediaCommonUse8"),
      ],
      proTip: t("schema.fieldTypeMediaProTip"),
      subHeaderText: t("schema.fieldTypeMediaSubHeader"),
    },
  ],
  relationship: [
    {
      type: "one_to_one",
      name: t("schema.fieldTypeOneToOneName"),
      shortDescription: t("schema.fieldTypeOneToOneShortDesc"),
      description: t("schema.fieldTypeOneToOneDescription"),
      commonUses: [
        t("schema.fieldTypeOneToOneCommonUse1"),
        t("schema.fieldTypeOneToOneCommonUse2"),
      ],
      proTip: t("schema.fieldTypeOneToOneProTip"),
      subHeaderText: t("schema.fieldTypeOneToOneSubHeader"),
    },
    {
      type: "one_to_many",
      name: t("schema.fieldTypeOneToManyName"),
      shortDescription: t("schema.fieldTypeOneToManyShortDesc"),
      description: t("schema.fieldTypeOneToManyDescription"),
      commonUses: [
        t("schema.fieldTypeOneToManyCommonUse1"),
        t("schema.fieldTypeOneToManyCommonUse2"),
      ],
      proTip: t("schema.fieldTypeOneToManyProTip"),
      subHeaderText: t("schema.fieldTypeOneToManySubHeader"),
    },
    {
      type: "link",
      name: t("schema.fieldTypeExternalUrlName"),
      shortDescription: t("schema.fieldTypeExternalUrlShortDesc"),
      description: t("schema.fieldTypeExternalUrlDescription"),
      commonUses: [
        t("schema.fieldTypeExternalUrlCommonUse1"),
        t("schema.fieldTypeExternalUrlCommonUse2"),
        t("schema.fieldTypeExternalUrlCommonUse3"),
      ],
      proTip: t("schema.fieldTypeExternalUrlProTip"),
      subHeaderText: t("schema.fieldTypeExternalUrlSubHeader"),
    },
    {
      type: "internal_link",
      name: t("schema.fieldTypeInternalLinkName"),
      shortDescription: t("schema.fieldTypeInternalLinkShortDesc"),
      description: t("schema.fieldTypeInternalLinkDescription"),
      commonUses: [
        t("schema.fieldTypeInternalLinkCommonUse1"),
        t("schema.fieldTypeInternalLinkCommonUse2"),
      ],
      proTip: t("schema.fieldTypeInternalLinkProTip"),
      subHeaderText: t("schema.fieldTypeInternalLinkSubHeader"),
    },
    {
      type: "block_selector",
      name: t("schema.fieldTypeBlockSelectorName"),
      shortDescription: t("schema.fieldTypeBlockSelectorShortDesc"),
      description: t("schema.fieldTypeBlockSelectorDescription"),
      commonUses: [
        t("schema.fieldTypeBlockSelectorCommonUse1"),
        t("schema.fieldTypeBlockSelectorCommonUse2"),
        t("schema.fieldTypeBlockSelectorCommonUse3"),
      ],
      proTip: t("schema.fieldTypeBlockSelectorProTip"),
      subHeaderText: t("schema.fieldTypeBlockSelectorSubHeader"),
    },
  ],
  numeric: [
    {
      type: "number",
      name: t("schema.fieldTypeNumberName"),
      shortDescription: t("schema.fieldTypeNumberShortDesc"),
      description: t("schema.fieldTypeNumberDescription"),
      commonUses: [
        t("schema.fieldTypeNumberCommonUse1"),
        t("schema.fieldTypeNumberCommonUse2"),
        t("schema.fieldTypeNumberCommonUse3"),
        t("schema.fieldTypeNumberCommonUse4"),
        t("schema.fieldTypeNumberCommonUse5"),
      ],
      proTip: t("schema.fieldTypeNumberProTip"),
      subHeaderText: t("schema.fieldTypeNumberSubHeader"),
    },
    {
      type: "currency",
      name: t("schema.fieldTypeCurrencyName"),
      shortDescription: t("schema.fieldTypeCurrencyShortDesc"),
      description: t("schema.fieldTypeCurrencyDescription"),
      commonUses: [
        t("schema.fieldTypeCurrencyCommonUse1"),
        t("schema.fieldTypeCurrencyCommonUse2"),
      ],
      proTip: t("schema.fieldTypeCurrencyProTip"),
      subHeaderText: t("schema.fieldTypeCurrencySubHeader"),
    },
  ],
  dateandtime: [
    {
      type: "date",
      name: t("schema.fieldTypeDateName"),
      shortDescription: t("schema.fieldTypeDateShortDesc"),
      description: t("schema.fieldTypeDateDescription"),
      commonUses: [
        t("schema.fieldTypeDateCommonUse1"),
        t("schema.fieldTypeDateCommonUse2"),
        t("schema.fieldTypeDateCommonUse3"),
        t("schema.fieldTypeDateCommonUse4"),
      ],
      proTip: t("schema.fieldTypeDateProTip"),
      subHeaderText: t("schema.fieldTypeDateSubHeader"),
    },
    {
      type: "datetime",
      name: t("schema.fieldTypeDateTimeName"),
      shortDescription: t("schema.fieldTypeDateTimeShortDesc"),
      description: t("schema.fieldTypeDateTimeDescription"),
      commonUses: [
        t("schema.fieldTypeDateTimeCommonUse1"),
        t("schema.fieldTypeDateTimeCommonUse2"),
        t("schema.fieldTypeDateTimeCommonUse3"),
      ],
      proTip: t("schema.fieldTypeDateTimeProTip"),
      subHeaderText: t("schema.fieldTypeDateTimeSubHeader"),
    },
  ],
  options: [
    {
      type: "yes_no",
      name: t("schema.fieldTypeBooleanName"),
      shortDescription: t("schema.fieldTypeBooleanShortDesc"),
      description: t("schema.fieldTypeBooleanDescription"),
      commonUses: [
        t("schema.fieldTypeBooleanCommonUse1"),
        t("schema.fieldTypeBooleanCommonUse2"),
        t("schema.fieldTypeBooleanCommonUse3"),
        t("schema.fieldTypeBooleanCommonUse4"),
      ],
      proTip: t("schema.fieldTypeBooleanProTip"),
      subHeaderText: t("schema.fieldTypeBooleanSubHeader"),
    },
    {
      type: "dropdown",
      name: t("schema.fieldTypeDropdownName"),
      shortDescription: t("schema.fieldTypeDropdownShortDesc"),
      description: t("schema.fieldTypeDropdownDescription"),
      commonUses: [
        t("schema.fieldTypeDropdownCommonUse1"),
        t("schema.fieldTypeDropdownCommonUse2"),
        t("schema.fieldTypeDropdownCommonUse3"),
        t("schema.fieldTypeDropdownCommonUse4"),
      ],
      proTip: t("schema.fieldTypeDropdownProTip"),
      subHeaderText: t("schema.fieldTypeDropdownSubHeader"),
    },
    {
      type: "color",
      name: t("schema.fieldTypeColorName"),
      shortDescription: t("schema.fieldTypeColorShortDesc"),
      description: t("schema.fieldTypeColorDescription"),
      commonUses: [
        t("schema.fieldTypeColorCommonUse1"),
        t("schema.fieldTypeColorCommonUse2"),
        t("schema.fieldTypeColorCommonUse3"),
        t("schema.fieldTypeColorCommonUse4"),
      ],
      proTip: t("schema.fieldTypeColorProTip"),
      subHeaderText: t("schema.fieldTypeColorSubHeader"),
    },
    {
      type: "sort",
      name: t("schema.fieldTypeSortOrderName"),
      shortDescription: t("schema.fieldTypeSortOrderShortDesc"),
      description: t("schema.fieldTypeSortOrderDescription"),
      commonUses: [
        t("schema.fieldTypeSortOrderCommonUse1"),
        t("schema.fieldTypeSortOrderCommonUse2"),
        t("schema.fieldTypeSortOrderCommonUse3"),
      ],
      proTip: t("schema.fieldTypeSortOrderProTip"),
      subHeaderText: t("schema.fieldTypeSortOrderSubHeader"),
    },
    {
      type: "integration",
      name: t("schema.fieldTypeIntegrationName"),
      shortDescription: t("schema.fieldTypeIntegrationShortDesc"),
      description: t("schema.fieldTypeIntegrationDescription"),
      commonUses: [
        t("schema.fieldTypeIntegrationCommonUse1"),
        t("schema.fieldTypeIntegrationCommonUse2"),
        t("schema.fieldTypeIntegrationCommonUse3"),
        t("schema.fieldTypeIntegrationCommonUse4"),
        t("schema.fieldTypeIntegrationCommonUse5"),
        t("schema.fieldTypeIntegrationCommonUse6"),
      ],
      proTip: t("schema.fieldTypeIntegrationProTip"),
      subHeaderText: t("schema.fieldTypeIntegrationSubHeader"),
    },
    {
      type: "uuid",
      name: t("schema.fieldTypeUuidName"),
      shortDescription: t("schema.fieldTypeUuidShortDesc"),
      description: t("schema.fieldTypeUuidDescription"),
      commonUses: [
        t("schema.fieldTypeUuidCommonUse1"),
        t("schema.fieldTypeUuidCommonUse2"),
        t("schema.fieldTypeUuidCommonUse3"),
      ],
      proTip: t("schema.fieldTypeUuidProTip"),
      subHeaderText: t("schema.fieldTypeUuidSubHeader"),
    },
    {
      type: "repeater",
      name: t("schema.fieldTypeRepeaterName"),
      shortDescription: t("schema.fieldTypeRepeaterShortDesc"),
      description: t("schema.fieldTypeRepeaterDescription"),
      commonUses: [
        t("schema.fieldTypeRepeaterCommonUse1"),
        t("schema.fieldTypeRepeaterCommonUse2"),
        t("schema.fieldTypeRepeaterCommonUse3"),
        t("schema.fieldTypeRepeaterCommonUse4"),
      ],
      proTip: t("schema.fieldTypeRepeaterProTip"),
      subHeaderText: t("schema.fieldTypeRepeaterSubHeader"),
    },
  ],
});

const getTypeText = (t: TranslateFn): Record<FieldType, string> => ({
  article_writer: t("schema.typeTextArticleWriter"),
  color: t("schema.typeTextColor"),
  currency: t("schema.typeTextCurrency"),
  date: t("schema.typeTextDate"),
  datetime: t("schema.typeTextDatetime"),
  dropdown: t("schema.typeTextDropdown"),
  files: t("schema.typeTextFiles"),
  fontawesome: t("schema.typeTextFontawesome"),
  images: t("schema.typeTextImages"),
  internal_link: t("schema.typeTextInternalLink"),
  link: t("schema.typeTextLink"),
  markdown: t("schema.typeTextMarkdown"),
  number: t("schema.typeTextNumber"),
  one_to_many: t("schema.typeTextOneToMany"),
  one_to_one: t("schema.typeTextOneToOne"),
  sort: t("schema.typeTextSort"),
  text: t("schema.typeTextText"),
  textarea: t("schema.typeTextTextarea"),
  uuid: t("schema.typeTextUuid"),
  wysiwyg_advanced: t("schema.typeTextWysiwygAdvanced"),
  wysiwyg_basic: t("schema.typeTextWysiwygBasic"),
  yes_no: t("schema.typeTextBoolean"),
  block_selector: t("schema.typeTextBlockSelector"),
  integration: t("schema.typeTextIntegration"),
  repeater: t("schema.typeTextRepeater"),
});

const getCommonFields = (t: TranslateFn): InputField[] => [
  {
    name: "label",
    type: "input",
    label: t("schema.commonFieldLabelLabel"),
    required: true,
    fullWidth: true,
    maxLength: 200,
    gridSize: 12,
    tooltip: t("schema.commonFieldLabelTooltip"),
    validate: ["required", "length"],
    autoFocus: true,
  },
  {
    name: "name",
    type: "input",
    label: t("schema.commonFieldNameLabel"),
    required: true,
    fullWidth: true,
    maxLength: 50,
    gridSize: 12,
    tooltip: t("schema.commonFieldNameTooltip"),
    validate: ["length", "required", "unique"],
  },
  {
    name: "tooltip",
    type: "input",
    label: t("schema.commonFieldTooltipLabel"),
    required: false,
    fullWidth: true,
    maxLength: 250,
    gridSize: 12,
    tooltip: t("schema.commonFieldTooltipTooltip"),
    validate: ["length"],
  },
  {
    name: "description",
    type: "input",
    label: t("schema.commonFieldDescriptionLabel"),
    required: false,
    fullWidth: true,
    multiline: true,
    maxLength: 500,
    gridSize: 12,
    tooltip: t("schema.commonFieldDescriptionTooltip"),
    validate: ["length"],
  },
  {
    name: "required",
    type: "checkbox",
    label: t("schema.commonFieldRequiredLabel"),
    subLabel: t("schema.commonFieldRequiredSubLabel"),
    required: false,
    gridSize: 12,
  },
  {
    name: "list",
    type: "checkbox",
    label: t("schema.commonFieldListLabel"),
    subLabel: t("schema.commonFieldListSubLabel"),
    required: false,
    gridSize: 12,
  },
];

const getCommonRules = (t: TranslateFn): InputField[] => [
  {
    name: "defaultValue",
    type: "input",
    label: t("schema.defaultValueLabel"),
    required: false,
    gridSize: 12,
  },
];

const getCharacterLimitRules = (t: TranslateFn): InputField[] => [
  {
    name: "minCharLimit",
    type: "input",
    label: t("schema.characterLimitMinLabel"),
    required: false,
    gridSize: 6,
  },
  {
    name: "maxCharLimit",
    type: "input",
    label: t("schema.characterLimitMaxLabel"),
    required: false,
    gridSize: 6,
  },
];

const getRegexRules = (t: TranslateFn): InputField[] => [
  {
    name: "regexMatchPattern",
    type: "input",
    label: t("schema.regexMatchPatternLabel"),
    required: false,
    gridSize: 6,
  },
  {
    name: "regexMatchErrorMessage",
    type: "input",
    label: t("schema.regexMatchErrorMessageLabel"),
    required: false,
    gridSize: 6,
  },
  {
    name: "regexRestrictPattern",
    type: "input",
    label: t("schema.regexRestrictPatternLabel"),
    required: false,
    gridSize: 6,
  },
  {
    name: "regexRestrictErrorMessage",
    type: "input",
    label: t("schema.regexRestrictErrorMessageLabel"),
    required: false,
    gridSize: 6,
  },
];

const getInputRangeRules = (t: TranslateFn): InputField[] => [
  {
    name: "minValue",
    type: "input",
    label: t("schema.minValueLabel"),
    required: false,
    gridSize: 6,
  },
  {
    name: "maxValue",
    type: "input",
    label: t("schema.maxValueLabel"),
    required: false,
    gridSize: 6,
  },
];

const getFormConfig = (t: TranslateFn): Record<FieldType, FormConfig> => {
  const COMMON_FIELDS = getCommonFields(t);
  const COMMON_RULES = getCommonRules(t);
  const CHARACTER_LIMIT_RULES = getCharacterLimitRules(t);
  const REGEX_RULES = getRegexRules(t);
  const INPUT_RANGE_RULES = getInputRangeRules(t);
  return {
    article_writer: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    color: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    currency: {
      details: [
        {
          name: "currency",
          type: "autocomplete",
          label: t("schema.currencyFieldLabel"),
          required: true,
          gridSize: 12,
          tooltip: t("schema.currencyFieldTooltip"),
          placeholder: t("schema.currencyFieldPlaceholder"),
          autoFocus: true,
        },
        {
          ...COMMON_FIELDS[0],
          autoFocus: false,
        },
        ...COMMON_FIELDS.slice(1),
      ],
      rules: [...COMMON_RULES, ...INPUT_RANGE_RULES],
    },
    date: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    datetime: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    dropdown: {
      details: [
        ...COMMON_FIELDS.slice(0, 4),
        {
          name: "options",
          type: "options",
          label: t("schema.dropdownOptionsLabel"),
          required: false,
          gridSize: 12,
          maxLength: 150,
          validate: ["length", "unique"],
        },
        ...COMMON_FIELDS.slice(4),
      ],
      rules: [...COMMON_RULES],
    },
    files: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_FIELDS],
    },
    fontawesome: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    images: {
      details: [...COMMON_FIELDS],
      rules: [
        {
          name: "limit",
          type: "input",
          label: t("schema.mediaItemLimitLabel"),
          required: false,
          gridSize: 12,
          inputType: "number",
          tooltip: t("schema.mediaItemLimitTooltip"),
        },
        {
          name: "group_id",
          type: "autocomplete",
          label: t("schema.selectFolderLabel"),
          required: false,
          gridSize: 12,
        },
        {
          name: "fileExtensions",
          type: "input",
          label: t("schema.fileExtensionsLabel"),
          required: false,
          gridSize: 12,
        },
        {
          name: "fileExtensionsErrorMessage",
          type: "input",
          label: t("schema.fileExtensionsErrorMessageLabel"),
          required: false,
          gridSize: 12,
        },
        ...COMMON_RULES,
      ],
    },
    internal_link: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    link: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    markdown: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    number: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES, ...INPUT_RANGE_RULES],
    },
    one_to_many: {
      details: [
        {
          name: "relatedModelZUID",
          type: "autocomplete",
          label: t("schema.referenceModelLabel"),
          required: false,
          gridSize: 6,
          placeholder: t("schema.referenceModelPlaceholder"),
          autoFocus: true,
        },
        {
          name: "relatedFieldZUID",
          type: "autocomplete",
          label: t("schema.fieldToDisplayLabel"),
          required: false,
          gridSize: 6,
          placeholder: t("schema.fieldToDisplayPlaceholder"),
        },
        {
          ...COMMON_FIELDS[0],
          autoFocus: false,
        },
        ...COMMON_FIELDS.slice(1),
      ],
      rules: [...COMMON_RULES],
    },
    one_to_one: {
      details: [
        {
          name: "relatedModelZUID",
          type: "autocomplete",
          label: t("schema.referenceModelLabel"),
          required: false,
          gridSize: 6,
          placeholder: t("schema.referenceModelPlaceholder"),
          autoFocus: true,
        },
        {
          name: "relatedFieldZUID",
          type: "autocomplete",
          label: t("schema.fieldToDisplayLabel"),
          required: false,
          gridSize: 6,
          placeholder: t("schema.fieldToDisplayPlaceholder"),
        },
        {
          ...COMMON_FIELDS[0],
          autoFocus: false,
        },
        ...COMMON_FIELDS.slice(1),
      ],
      rules: [...COMMON_RULES],
    },
    sort: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    text: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES, ...CHARACTER_LIMIT_RULES, ...REGEX_RULES],
    },
    textarea: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES, ...CHARACTER_LIMIT_RULES, ...REGEX_RULES],
    },
    uuid: {
      details: [...COMMON_FIELDS],
      rules: [],
    },
    wysiwyg_advanced: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    wysiwyg_basic: {
      details: [...COMMON_FIELDS],
      rules: [...COMMON_RULES],
    },
    yes_no: {
      details: [
        ...COMMON_FIELDS.slice(0, 3),
        {
          name: "options",
          type: "toggle_options",
          label: t("schema.booleanOptionsLabel"),
          required: false,
          gridSize: 12,
          maxLength: 150,
          validate: ["length"],
        },
        ...COMMON_FIELDS.slice(3),
      ],
      rules: [...COMMON_RULES],
    },
    block_selector: {
      details: [...COMMON_FIELDS],
      rules: [],
    },
    integration: {
      details: [
        ...COMMON_FIELDS.slice(0, 4),
        {
          name: "integrationFieldConfig",
          type: "config",
          label: t("schema.apiUrlLabel"),
          required: true,
          gridSize: 12,
          maxLength: 150,
        },

        ...COMMON_FIELDS.slice(4),
      ],
      rules: [...INPUT_RANGE_RULES],
    },
    repeater: {
      details: [...COMMON_FIELDS.slice(0, 4)],
      rules: [],
    },
  };
};

const getSystemFields = (t: TranslateFn): SystemField[] => [
  {
    label: t("schema.systemFieldItemZuid"),
    datatype: "uuid",
    name: "ZUID",
  },
  {
    label: t("schema.systemFieldCreatedAt"),
    datatype: "datetime",
    name: "createdAt",
  },
  {
    label: t("schema.systemFieldUpdatedAt"),
    datatype: "datetime",
    name: "updatedAt",
  },
  {
    label: t("schema.systemFieldVersion"),
    datatype: "number",
    name: "version",
  },
  {
    label: t("schema.systemFieldMasterZuid"),
    datatype: "uuid",
    name: "masterZUID",
  },
  {
    label: t("schema.systemFieldModelZuid"),
    datatype: "uuid",
    name: "contentModelZUID",
  },
];

const getSeoFields = (t: TranslateFn): SystemField[] => [
  {
    label: t("schema.seoFieldMetaTitle"),
    datatype: "text",
    name: "seo_meta_title",
  },
  {
    label: t("schema.seoFieldMetaDescription"),
    datatype: "textarea",
    name: "seo_meta_description",
  },
  {
    label: t("schema.seoFieldMetaKeywords"),
    datatype: "textarea",
    name: "seo_meta_keywords",
  },
  {
    label: t("schema.seoFieldLinkTitle"),
    datatype: "text",
    name: "seo_link_title",
  },
];

export const FIELD_CATEGORY_LABELS: Record<string, string> = {
  dateandtime: "Date & Time",
  options: "Advanced",
};

export {
  FieldListData,
  getFieldCopyConfig,
  getTypeText,
  getFormConfig,
  getSystemFields,
  getSeoFields,
  SystemField,
};
