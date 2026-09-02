import { Error } from "../../../../components/Editor/Field/FieldShell";
import i18n from "shell/i18n";

export const hasErrors = (errors: Error) => {
  if (!errors) return false;

  return Object.values(errors).some((error) => !!error);
};

export const validateMetaDescription = (value: string) => {
  let message = "";

  if (!value) return message;

  if (!(value.indexOf("\u0152") === -1)) {
    message = i18n.t("content.itemEditMetaDescriptionFoundOeLigature");
  } else if (!(value.indexOf("\u0153") === -1)) {
    message = i18n.t("content.itemEditMetaDescriptionFoundSmallOeLigature");
  } else if (!(value.indexOf("\xAB") === -1)) {
    message = i18n.t("content.itemEditMetaDescriptionFoundLeftGuillemet");
  } else if (!(value.indexOf("\xBB") === -1)) {
    message = i18n.t("content.itemEditMetaDescriptionFoundRightGuillemet");
  } else if (/[\u201C\u201D\u201E]/.test(value)) {
    message = i18n.t("content.itemEditMetaDescriptionFoundSmartDoubleQuotes");
  } else if (/[\u2018\u2019\u201A]/.test(value)) {
    message = i18n.t("content.itemEditMetaDescriptionFoundSmartSingleQuotes");
  }

  return message;
};
