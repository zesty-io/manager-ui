import { Error } from "../../../../components/Editor/Field/FieldShell";

export const hasErrors = (errors: Error) => {
  if (!errors) return false;

  return Object.values(errors).some((error) => !!error);
};

export const validateMetaDescription = (value: string) => {
  let message = "";

  if (!value) return message;

  if (!(value.indexOf("\u0152") === -1)) {
    message =
      "Found OE ligature. These special characters are not allowed in meta descriptions.";
  } else if (!(value.indexOf("\u0153") === -1)) {
    message =
      "Found oe ligature. These special characters are not allowed in meta descriptions.";
  } else if (!(value.indexOf("\xAB") === -1)) {
    message =
      "Found << character. These special characters are not allowed in meta descriptions.";
  } else if (!(value.indexOf("\xBB") === -1)) {
    message =
      "Found >> character. These special characters are not allowed in meta descriptions.";
  } else if (/[\u201C\u201D\u201E]/.test(value)) {
    message =
      "Found Microsoft Smart double quotes and/or apostrophe. These special characters are not allowed in meta descriptions as it may lead to incorrect rendering, where characters show up as � or other odd symbols. Please use straight quotes (' and \") instead.";
  } else if (/[\u2018\u2019\u201A]/.test(value)) {
    message =
      "Found Microsoft Smart single quotes and/or apostrophe. These special characters are not allowed in meta descriptions as it may lead to incorrect rendering, where characters show up as � or other odd symbols. Please use straight quotes (' and \") instead.";
  }

  return message;
};
