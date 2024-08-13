import { Error } from "../../../../components/Editor/Field/FieldShell";

export const hasErrors = (errors: Error) => {
  if (!errors) return false;

  return Object.values(errors).some((error) => !!error);
};
